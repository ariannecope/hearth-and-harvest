import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getFarmId, setFarmId, FARM_CODE } from '../lib/api.js';
import { parseZone } from '../lib/planting.js';

const FarmContext = createContext(null);
const COMPARE_KEY = 'hh.compare';
const MAX_COMPARE = 4;

function loadCompare() {
  try {
    return JSON.parse(sessionStorage.getItem(COMPARE_KEY)) || [];
  } catch {
    return [];
  }
}

export function FarmProvider({ children }) {
  const [farm, setFarm] = useState(null);
  const [plans, setPlans] = useState({ plants: [], breeds: [] });
  const [status, setStatus] = useState(getFarmId() ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const [compare, setCompare] = useState(loadCompare);
  const toastTimer = useRef();

  // `link` ({ to, label }) makes the toast clickable; those stay up two seconds longer to give time to click.
  const notify = useCallback((message, tone = 'success', link = null) => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone, link, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), link ? 5200 : 3200);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const refreshPlans = useCallback(async () => {
    if (!getFarmId()) return;
    setPlans(await api.plans());
  }, []);

  const load = useCallback(async () => {
    if (!getFarmId()) return setStatus('ready');
    setStatus('loading');
    setLoadError(null);
    try {
      const [f, p] = await Promise.all([api.farm(), api.plans()]);
      setFarm(f);
      setPlans(p);
    } catch (err) {
      if (err.status === 404 || err.status === 400) setFarmId(null); // farm no longer exists
      else setLoadError(err.message);
    }
    setStatus('ready');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      sessionStorage.setItem(COMPARE_KEY, JSON.stringify(compare));
    } catch {
      /* ignore */
    }
  }, [compare]);

  const saveFarm = useCallback(async (data) => {
    const saved = farm ? await api.updateFarm(data) : await api.createFarm(data);
    setFarmId(saved.id);
    setFarm(saved);
    if (!farm) setPlans({ plants: [], breeds: [] });
    return saved;
  }, [farm]);

  // Open an existing farm by its code (e.g. on a second device). Checks the farm
  // exists before replacing whatever farm this browser currently has open.
  const openFarm = useCallback(async (code) => {
    const id = String(code ?? '').trim().toLowerCase();
    if (!FARM_CODE.test(id)) throw new Error("That doesn't look like a farm code. It should be 36 characters, like 1a2b3c4d-....");
    let f, p;
    try {
      [f, p] = await Promise.all([api.farm(id), api.plans(id)]);
    } catch (err) {
      if (err.status === 404) throw new Error('We couldn\'t find a farm with that code. Check it and try again.');
      throw err;
    }
    setFarmId(id);
    setFarm(f);
    setPlans(p);
    setLoadError(null);
    setStatus('ready');
    return f;
  }, []);

  // Forget this browser's farm. The farm stays on the server and can be reopened with its code.
  const signOut = useCallback(() => {
    setFarmId(null);
    setFarm(null);
    setPlans({ plants: [], breeds: [] });
    setCompare([]);
    setLoadError(null);
  }, []);

  const addPlant = useCallback(async (plant, planting_date) => {
    await api.addPlan({ type: 'plant', item_id: plant.id, planting_date });
    await refreshPlans();
    notify(`${plant.common_name} added to your garden plan`, 'success', { to: '/plans', label: 'View plan' });
  }, [refreshPlans, notify]);

  const addBreed = useCallback(async (breed) => {
    await api.addPlan({ type: 'breed', item_id: breed.id });
    await refreshPlans();
    notify(`${breed.breed_name} added to your livestock plan`, 'success', { to: '/plans', label: 'View plan' });
  }, [refreshPlans, notify]);

  const updatePlan = useCallback(async (type, planId, patch) => {
    await api.updatePlan(type, planId, patch);
    await refreshPlans();
  }, [refreshPlans]);

  const removePlan = useCallback(async (type, planId, name) => {
    await api.removePlan(type, planId);
    await refreshPlans();
    notify(`${name} removed from your plan`);
  }, [refreshPlans, notify]);

  const toggleCompare = useCallback((id) => {
    if (compare.includes(id)) return setCompare(compare.filter((x) => x !== id));
    if (compare.length >= MAX_COMPARE) return notify(`You can compare up to ${MAX_COMPARE} breeds at a time`, 'info');
    setCompare([...compare, id]);
  }, [compare, notify]);

  const value = useMemo(() => {
    const plantPlanIds = new Map(plans.plants.map((p) => [p.id, p.plan_id]));
    const breedPlanIds = new Map(plans.breeds.map((b) => [b.id, b.plan_id]));
    return {
      farm, plans, status, loadError, retry: load,
      zone: parseZone(farm?.growing_zone),
      saveFarm, openFarm, signOut, addPlant, addBreed, updatePlan, removePlan,
      plantPlanIds, breedPlanIds,
      compare, toggleCompare, clearCompare: () => setCompare([]), maxCompare: MAX_COMPARE,
      toast, notify, dismissToast,
    };
  }, [farm, plans, status, loadError, load, saveFarm, openFarm, signOut, addPlant, addBreed, updatePlan, removePlan, compare, toggleCompare, toast, notify, dismissToast]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  return useContext(FarmContext);
}
