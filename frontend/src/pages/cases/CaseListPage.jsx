import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

export const CaseListPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCases({
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
      });
      setCases(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [departmentFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCases();
  };

  // Pagination slice
  const totalPages = Math.ceil(cases.length / pageSize) || 1;
  const paginatedCases = cases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Case Number',
      render: (row) => (
        <Link to={`/cases/${row.id}`}>
          <strong>{row.caseNumber}</strong>
        </Link>
      ),
    },
    { header: 'Title / Parties', key: 'title' },
    { header: 'Court Name', key: 'courtName' },
    { header: 'Case Type', key: 'caseType' },
    { header: 'Department', key: 'department' },
    { header: 'Stage', key: 'currentStage' },
    { header: 'Next Date', render: (row) => formatDate(row.nextHearingDate) },
    { header: 'Exposure', render: (row) => formatINR(row.financialExposure) },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div>
          <Link to={`/cases/${row.id}`}>View</Link>
          {' | '}
          <Link to={`/cases/${row.id}/edit`}>Edit</Link>
        </div>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Master Case Register</h2>
        <p>Litigation repository for the Government of Gujarat</p>
      </header>

      {/* Action Bar */}
      <div>
        <Link to="/cases/new">
          <button type="button">+ Register New Case</button>
        </Link>
      </div>

      <br />

      {/* Search and Filters */}
      <section>
        <form onSubmit={handleSearchSubmit}>
          <fieldset>
            <legend>Filter &amp; Search Cases</legend>

            <div>
              <label htmlFor="search">Search Case Number / Title: </label>
              <input
                id="search"
                type="text"
                placeholder="e.g. SCA/1024 or Patel"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {' '}
              <button type="submit">Search</button>
            </div>

            <br />

            <div>
              <label htmlFor="dept-filter">Department: </label>
              <select
                id="dept-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="Revenue Department">Revenue Department</option>
                <option value="Industries and Mines Department">Industries &amp; Mines</option>
                <option value="Home Department">Home Department</option>
                <option value="Urban Development & Urban Housing">Urban Development</option>
              </select>

              {' | '}

              <label htmlFor="status-filter">Status: </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISPOSED">DISPOSED</option>
                <option value="STAYED">STAYED</option>
              </select>
            </div>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Case Table */}
      <section>
        {loading ? (
          <p>Loading case records...</p>
        ) : (
          <>
            <DataTable columns={columns} data={paginatedCases} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={cases.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </article>
  );
};

export default CaseListPage;
