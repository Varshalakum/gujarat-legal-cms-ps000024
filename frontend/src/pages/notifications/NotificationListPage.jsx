import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';

export const NotificationListPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      alert('Failed to mark notification as read.');
    }
  };

  const filtered = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const columns = [
    { header: 'Notification ID', key: 'id' },
    { header: 'Target Role', render: (row) => <code>{row.recipientRole}</code> },
    { header: 'Event Trigger', key: 'event' },
    {
      header: 'Subject & Description',
      render: (row) => (
        <div>
          <strong>{row.title}</strong>
          <br />
          <small>{row.message}</small>
        </div>
      ),
    },
    {
      header: 'Linked Docket',
      render: (row) =>
        row.linkedCaseNumber ? (
          <span>Case: {row.linkedCaseNumber}</span>
        ) : row.linkedBillId ? (
          <Link to={`/bills/${row.linkedBillId}`}>Bill: {row.linkedBillId}</Link>
        ) : (
          'System Global'
        ),
    },
    { header: 'Due Date / SLA', render: (row) => formatDate(row.dueDate) },
    {
      header: 'Status',
      render: (row) => (row.isRead ? <span>Read</span> : <strong>[UNREAD]</strong>),
    },
    {
      header: 'Action',
      render: (row) =>
        !row.isRead ? (
          <button type="button" onClick={() => handleMarkAsRead(row.id)}>
            Mark Read
          </button>
        ) : (
          <span>&check; Seen</span>
        ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Regulatory Alert &amp; Task Notification Center</h2>
        <p>Real-time SLA notifications, stage alerts, and compliance deadlines</p>
      </header>

      <section>
        <fieldset>
          <legend>Filter Notifications</legend>
          <label>
            <input
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={(e) => setFilterUnreadOnly(e.target.checked)}
            />{' '}
            Show Unread Alerts Only
          </label>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Loading notification queue...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No pending notifications in queue."
          />
        )}
      </section>
    </article>
  );
};

export default NotificationListPage;
