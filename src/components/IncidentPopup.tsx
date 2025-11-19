import type { Incident } from '../types';
import { format } from 'date-fns';

interface IncidentPopupProps {
  incident: Incident;
}

const IncidentPopup = ({ incident }: IncidentPopupProps) => {
  const getIncidentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      bandit_attack: 'Bandit Attack',
      fulani_herdsmen: 'Fulani Herdsmen',
      boko_haram: 'Boko Haram',
      iswap: 'ISWAP',
      communal_clash: 'Communal Clash',
      kidnapping: 'Kidnapping',
      terror_attack: 'Terror Attack',
      unknown: 'Unknown',
    };
    return labels[type] || type;
  };

  return (
    <div className="incident-popup">
      <h3>{incident.title}</h3>
      <div className="incident-details">
        <p><strong>Location:</strong> {incident.location.state}</p>
        <p><strong>Type:</strong> {getIncidentTypeLabel(incident.type)}</p>
        <p><strong>Date:</strong> {format(new Date(incident.date), 'MMM dd, yyyy')}</p>
        {incident.casualties.total > 0 && (
          <p><strong>Casualties:</strong> {incident.casualties.total}</p>
        )}
        {(incident.buildingsDestroyed.churches > 0 || incident.buildingsDestroyed.mosques > 0) && (
          <p>
            <strong>Buildings Destroyed:</strong>{' '}
            {incident.buildingsDestroyed.churches > 0 && `${incident.buildingsDestroyed.churches} church(es)`}
            {incident.buildingsDestroyed.churches > 0 && incident.buildingsDestroyed.mosques > 0 && ', '}
            {incident.buildingsDestroyed.mosques > 0 && `${incident.buildingsDestroyed.mosques} mosque(s)`}
          </p>
        )}
        <p><strong>Source:</strong> {incident.source}</p>
        <a
          href={incident.url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-more-link"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
};

export default IncidentPopup;

