import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, LogOut, Search, X, User, ChevronLeft, ChevronRight, LoaderCircleIcon } from 'lucide-react';
import DataTable from 'react-data-table-component';
import { getUsers, deleteUser, updateUser } from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

export const UserList = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [design, setDesign] = useState('dataTable');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(page);
      setUsers(response.data);
      setTotalRows(response.total);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [page, perPage]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateUser(currentUser.id, formData);
      toast.success('User updated successfully');
      closeEditModal();
      setLoading(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customStyles = {
    header: {
      style: {
        backgroundColor: '#6366F1',
        color: '#fff',
        borderRadius: '8px 8px 0 0',
        padding: '20px',
        fontSize: '1.25rem',
        '@media screen and (max-width: 768px)': {
          padding: '16px',
          fontSize: '1rem',
        },
      },
    },
    headRow: {
      style: {
        color: '#6B7280',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #E5E7EB',
        padding: '0.75rem 1rem',
        '@media screen and (max-width: 768px)': {
          display: 'none',
        },
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #E5E7EB',
        },
        '&:hover': {
          backgroundColor: '#F9FAFB',
        },
        '@media screen and (max-width: 768px)': {
          display: 'block',
          width: '100%',
          padding: '16px',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        padding: '1rem',
        color: '#374151',
        '@media screen and (max-width: 768px)': {
          display: 'block',
          padding: '8px 0',
          '&:before': {
            content: 'attr(data-label)',
            fontWeight: 'bold',
            width: '120px',
            display: 'inline-block',
            color: '#6366F1',
          },
        },
      },
    },
    pagination: {
      style: {
        borderTop: 'none',
        padding: '1rem 0',
      },
    },
  };

  const CustomPagination = ({ rowsPerPage, rowCount, onChangePage, currentPage }) => {
    const pages = Math.ceil(rowCount / rowsPerPage);
    const range = (start, end) => Array.from({ length: end - start + 1 }, (v, k) => k + start);
    const items = range(1, pages);

    return (
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, rowCount)} of {rowCount} users
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onChangePage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {items.map(page => (
            <button
              key={page}
              onClick={() => onChangePage(page)}
              className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onChangePage(Math.min(pages, currentPage + 1))}
            disabled={currentPage === pages}
            className={`px-3 py-1 rounded-md ${currentPage === pages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const columns = [
    {
      name: 'User',
      selector: (row) => `${row.first_name} ${row.last_name}`,
      cell: (row) => (
        <div className="flex items-center">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={`${row.first_name} ${row.last_name}`}
              className="h-10 w-10 rounded-full mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-indigo-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Status',
      selector: (row) => row.status || 'Active',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${row.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {row.status || 'Active'}
        </span>
      ),
      center: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex w-full space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="mt-3 md:mt-0 w-full flex items-center justify-center bg-indigo-50 p-2 text-indigo-500 hover:bg-indigo-100 rounded-md transition-colors duration-200"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentUser(row);
              setIsDeleteModalOpen(true);
            }}
            className="mt-3 md:mt-0 w-full flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '100px',
    },
  ];

  console.log(filteredUsers)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-end mb-6">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={() => setDesign('dataTable')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${design === 'dataTable'
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setDesign('custom')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${design === 'custom'
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Card View
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your users and their permissions</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search users..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {design === 'custom' ? (
            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoaderCircleIcon className="animate-spin h-8 w-8 text-indigo-500" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <User className="w-full h-full" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'No users available'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <div className="p-5">
                          <div className="flex items-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-indigo-500" />
                              </div>
                            )}
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Inactive'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                              }`}>
                              {user.status || 'Active'}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 flex justify-between space-x-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-medium">{(page - 1) * perPage + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * perPage, totalRows)}</span> of{' '}
                      <span className="font-medium">{totalRows}</span> users
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded-md border ${page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePageChange(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                        disabled={page === Math.ceil(totalRows / perPage)}
                        className={`px-3 py-1 rounded-md border ${page === Math.ceil(totalRows / perPage)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="md:p-6">
              <DataTable
                columns={columns}
                data={filteredUsers}
                customStyles={customStyles}
                pagination
                paginationServer
                paginationComponent={CustomPagination}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[5, 10, 20]}
                paginationTotalRows={totalRows}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                progressPending={loading}
                progressComponent={<LoaderCircleIcon className="animate-spin h-12 w-12 text-indigo-500" />}
              />
            </div>
          )}
        </div>

        {isEditModalOpen && currentUser && (
          <Modal isOpen={isEditModalOpen} closeModal={closeEditModal}>
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500 cursor-pointer rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-neutral-700 focus:border-neutral-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-neutral-700 focus:border-neutral-700"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-neutral-700 focus:border-neutral-700"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <LoaderCircleIcon className="animate-spin mr-2" />
                      Updating...
                    </span>
                  ) : 'Update User'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {isDeleteModalOpen && (
          <Modal isOpen={isDeleteModalOpen} closeModal={() => setIsDeleteModalOpen(false)}>
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete user</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {currentUser?.first_name} {currentUser?.last_name}? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleDelete(currentUser?.id)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <LoaderCircleIcon className="animate-spin mr-2" />
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};