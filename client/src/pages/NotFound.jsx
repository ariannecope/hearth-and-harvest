import { EmptyState } from '../components/States.jsx';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState title="This path leads off the farm" action="Back to the home page" to="/">
        We couldn't find that page.
      </EmptyState>
    </div>
  );
}
