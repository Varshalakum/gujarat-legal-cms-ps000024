import React from 'react';
import { formatDate } from '../services/api';

export const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return <p><em>No timeline events recorded.</em></p>;
  }

  return (
    <ol reversed>
      {events.map((event, idx) => (
        <li key={idx}>
          <article>
            <header>
              <strong>{event.action || event.title || 'Event'}</strong>
              {' &bull; '}
              <time dateTime={event.date || event.timestamp}>
                {formatDate(event.date || event.timestamp)}
              </time>
              {event.actor ? <span> by <em>{event.actor}</em></span> : null}
            </header>
            {event.notes ? <p>{event.notes}</p> : null}
            {event.reason ? <p><strong>Reason:</strong> {event.reason}</p> : null}
            {event.status ? (
              <p>
                <small>Status: <code>{event.status}</code></small>
              </p>
            ) : null}
          </article>
          <hr />
        </li>
      ))}
    </ol>
  );
};

export default Timeline;
