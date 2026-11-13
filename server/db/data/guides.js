// Crop-specific growing guides from three land-grant extension services covering
// different climates. Every URL and title was checked against the live page (Nov 2026).
// Keys must match plants.js common_name; setup fails loudly if one doesn't.

const UMN = { org: 'University of Minnesota Extension', region: 'Upper Midwest' };
const ILL = { org: 'University of Illinois Extension', region: 'Midwest' };
const CLEMSON = { org: 'Clemson Home & Garden Information Center', region: 'Southeast' };

const g = (src, name, url) => ({ name, url, ...src });

export default {
  "Tomato": [
    g(UMN, "Growing tomatoes in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-tomatoes"),
    g(ILL, "Tomato", "https://extension.illinois.edu/gardening/tomato"),
    g(CLEMSON, "Tomato", "https://hgic.clemson.edu/factsheet/tomato/"),
  ],
  "Bell Pepper": [
    g(UMN, "Growing peppers", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-peppers"),
    g(ILL, "Peppers", "https://extension.illinois.edu/gardening/peppers"),
    g(CLEMSON, "Pepper", "https://hgic.clemson.edu/factsheet/pepper/"),
  ],
  "Eggplant": [
    g(UMN, "Growing eggplant in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-eggplant"),
    g(ILL, "Eggplant", "https://extension.illinois.edu/gardening/eggplant"),
    g(CLEMSON, "Eggplant", "https://hgic.clemson.edu/factsheet/eggplant/"),
  ],
  "Cucumber": [
    g(UMN, "Growing cucumbers in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-cucumbers"),
    g(ILL, "Cucumber", "https://extension.illinois.edu/gardening/cucumber"),
    g(CLEMSON, "Cucumber", "https://hgic.clemson.edu/factsheet/cucumber/"),
  ],
  "Summer Squash & Zucchini": [
    g(UMN, "Growing summer squash and zucchini in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-summer-squash-and-zucchini"),
    g(ILL, "Summer Squash", "https://extension.illinois.edu/gardening/summer-squash"),
    g(CLEMSON, "Summer Squash", "https://hgic.clemson.edu/factsheet/summer-squash/"),
  ],
  "Winter Squash (Butternut)": [
    g(ILL, "Winter Squash", "https://extension.illinois.edu/gardening/winter-squash"),
    g(CLEMSON, "Pumpkins & Winter Squash", "https://hgic.clemson.edu/factsheet/pumpkins-winter-squash/"),
  ],
  "Pumpkin": [
    g(ILL, "Pumpkin", "https://extension.illinois.edu/gardening/pumpkin"),
    g(CLEMSON, "Pumpkins & Winter Squash", "https://hgic.clemson.edu/factsheet/pumpkins-winter-squash/"),
  ],
  "Bush Bean": [
    g(UMN, "Growing beans in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-beans"),
    g(ILL, "Snap Beans", "https://extension.illinois.edu/gardening/snap-beans"),
    g(CLEMSON, "Bush & Pole-Type Snap Beans", "https://hgic.clemson.edu/factsheet/bush-pole-type-snap-beans/"),
  ],
  "Sweet Corn": [
    g(UMN, "Growing sweet corn in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-sweet-corn"),
    g(ILL, "Corn", "https://extension.illinois.edu/gardening/corn"),
    g(CLEMSON, "Sweet Corn", "https://hgic.clemson.edu/factsheet/sweet-corn/"),
  ],
  "Okra": [
    g(ILL, "Okra", "https://extension.illinois.edu/gardening/okra"),
    g(CLEMSON, "How to Grow Okra in South Carolina", "https://hgic.clemson.edu/factsheet/how-to-grow-okra-in-south-carolina-including-planting-dates-watering-fertilizing-ratooning-pest-management-and-harvesting-tips-for-healthy-pod-production/"),
  ],
  "Watermelon": [
    g(UMN, "Growing melons in the home garden", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-melons-in-the-home-garden"),
    g(ILL, "Watermelon", "https://extension.illinois.edu/gardening/watermelon"),
    g(CLEMSON, "Watermelons", "https://hgic.clemson.edu/factsheet/watermelons/"),
  ],
  "Sweet Potato": [
    g(ILL, "Sweet Potato", "https://extension.illinois.edu/gardening/sweet-potato"),
    g(CLEMSON, "Sweetpotato", "https://hgic.clemson.edu/factsheet/sweet-potato/"),
  ],
  "Garden Pea": [
    g(UMN, "Growing peas in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-peas"),
    g(ILL, "Peas", "https://extension.illinois.edu/gardening/peas"),
    g(CLEMSON, "Garden Peas", "https://hgic.clemson.edu/factsheet/garden-peas/"),
  ],
  "Lettuce": [
    g(UMN, "Growing lettuce, endive and radicchio in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-lettuce-endive-and-radicchio"),
    g(ILL, "Lettuce", "https://extension.illinois.edu/gardening/lettuce"),
    g(CLEMSON, "Lettuce", "https://hgic.clemson.edu/factsheet/lettuce/"),
  ],
  "Spinach": [
    g(UMN, "Growing spinach and Swiss chard in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-spinach-and-swiss-chard"),
    g(ILL, "Spinach", "https://extension.illinois.edu/gardening/spinach"),
    g(CLEMSON, "Spinach", "https://hgic.clemson.edu/factsheet/spinach/"),
  ],
  "Kale": [
    g(UMN, "Growing collards and kale in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-collards-and-kale"),
    g(CLEMSON, "Arugula, Kale, Mesclun, Mustard, and Swiss Chard", "https://hgic.clemson.edu/factsheet/arugula-kale-mesclun-mustard-and-swiss-chard/"),
  ],
  "Cabbage": [
    g(UMN, "Growing cabbage in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-cabbage"),
    g(ILL, "Cabbage", "https://extension.illinois.edu/gardening/cabbage"),
    g(CLEMSON, "Cabbage & Chinese Cabbage", "https://hgic.clemson.edu/factsheet/cabbage-chinese-cabbage/"),
  ],
  "Broccoli": [
    g(UMN, "Growing broccoli in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-broccoli"),
    g(ILL, "Broccoli", "https://extension.illinois.edu/gardening/broccoli"),
    g(CLEMSON, "Broccoli", "https://hgic.clemson.edu/factsheet/broccoli/"),
  ],
  "Carrot": [
    g(UMN, "Growing carrots and parsnips in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-carrots-and-parsnips"),
    g(ILL, "Carrots", "https://extension.illinois.edu/gardening/carrots"),
    g(CLEMSON, "Carrot, Beet, Radish & Parsnip", "https://hgic.clemson.edu/factsheet/carrot-beet-radish-parsnip/"),
  ],
  "Beet": [
    g(ILL, "Beet", "https://extension.illinois.edu/gardening/beet"),
    g(CLEMSON, "Carrot, Beet, Radish & Parsnip", "https://hgic.clemson.edu/factsheet/carrot-beet-radish-parsnip/"),
  ],
  "Radish": [
    g(UMN, "Growing radishes in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-radishes"),
    g(ILL, "Radish", "https://extension.illinois.edu/gardening/radish"),
    g(CLEMSON, "Carrot, Beet, Radish & Parsnip", "https://hgic.clemson.edu/factsheet/carrot-beet-radish-parsnip/"),
  ],
  "Onion": [
    g(UMN, "Growing onions in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-onions"),
    g(ILL, "Onion", "https://extension.illinois.edu/gardening/onion"),
    g(CLEMSON, "Onion, Leek, Shallot, & Garlic", "https://hgic.clemson.edu/factsheet/onion-leek-shallot-garlic/"),
  ],
  "Garlic": [
    g(UMN, "Growing garlic in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-garlic"),
    g(ILL, "Garlic", "https://extension.illinois.edu/herbs/garlic"),
    g(CLEMSON, "Onion, Leek, Shallot, & Garlic", "https://hgic.clemson.edu/factsheet/onion-leek-shallot-garlic/"),
  ],
  "Potato": [
    g(UMN, "Growing potatoes in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-potatoes"),
    g(ILL, "Potato", "https://extension.illinois.edu/gardening/potato"),
    g(CLEMSON, "Potato", "https://hgic.clemson.edu/factsheet/potato/"),
  ],
  "Basil": [
    g(ILL, "Basil", "https://extension.illinois.edu/herbs/basil"),
    g(CLEMSON, "Basil", "https://hgic.clemson.edu/factsheet/basil/"),
    g(UMN, "Growing herbs in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"),
  ],
  "Parsley": [
    g(UMN, "Growing parsley in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-parsley"),
    g(ILL, "Parsley", "https://extension.illinois.edu/herbs/parsley"),
  ],
  "Cilantro": [
    g(ILL, "Cilantro", "https://extension.illinois.edu/herbs/cilantro"),
    g(UMN, "Growing herbs in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"),
  ],
  "Dill": [
    g(UMN, "Growing dill in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-dill"),
    g(ILL, "Dill", "https://extension.illinois.edu/herbs/dill"),
  ],
  "Thyme": [
    g(ILL, "Thyme", "https://extension.illinois.edu/herbs/thyme"),
    g(UMN, "Growing herbs in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"),
  ],
  "Rosemary": [
    g(ILL, "Rosemary", "https://extension.illinois.edu/herbs/rosemary"),
    g(UMN, "Growing herbs in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"),
  ],
  "Chives": [
    g(UMN, "Growing chives in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-chives"),
    g(ILL, "Chives", "https://extension.illinois.edu/herbs/chives"),
  ],
  "Strawberry": [
    g(UMN, "Growing strawberries in the home garden", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-strawberries-in-the-home-garden"),
    g(CLEMSON, "Strawberry Basics", "https://hgic.clemson.edu/factsheet/strawberry-basics/"),
  ],
  "Highbush Blueberry": [
    g(UMN, "Growing blueberries in the home garden", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-blueberries-in-the-home-garden"),
    g(CLEMSON, "Blueberry", "https://hgic.clemson.edu/factsheet/blueberry/"),
  ],
  "Red Raspberry": [
    g(UMN, "Growing raspberries in the home garden", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-raspberries-in-the-home-garden"),
  ],
  "Rhubarb": [
    g(UMN, "Growing rhubarb in home gardens", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-rhubarb"),
    g(ILL, "Rhubarb", "https://extension.illinois.edu/gardening/rhubarb"),
  ],
};
