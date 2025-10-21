import { Table, Tag, Input, Select, message } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getUsers, setPagination, setFilters, clearMessage } from '../../../../slice/managementUserSlice';

const { Search } = Input;
const { Option } = Select;

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin':
      return 'purple';
    case 'Moderator':
      return 'orange';
    case 'User':
      return 'blue';
    default:
      return 'blue';
  }
};

const getStatusColor = (status) => {
  return status === 'Active' ? 'green' : 'red';
};

const getColumns = (t) => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: t('user.name'), dataIndex: 'name', key: 'name' },
  { title: t('user.email'), dataIndex: 'email', key: 'email' },
  {
    title: t('user.role'),
    dataIndex: 'role',
    key: 'role',
    render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>,
  },
  {
    title: t('user.status'),
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
  },
  { title: t('user.updated'), dataIndex: 'updated', key: 'updated' },
];

export default function User() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { users, loading, pagination, filters, message: storeMessage } = useSelector((state) => state.managementUserSlice);

  useEffect(() => {
    dispatch(getUsers({ currentPage: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (storeMessage) {
      if (storeMessage.type === 'success') {
        message.success(storeMessage.text);
      } else if (storeMessage.type === 'error') {
        message.error(storeMessage.text);
      }
      dispatch(clearMessage());
    }
  }, [storeMessage, dispatch]);

  const handleTableChange = (paginationInfo) => {
    const newPagination = {
      currentPage: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    };
    dispatch(setPagination(newPagination));
    dispatch(
      getUsers({
        currentPage: paginationInfo.current,
        pageSize: paginationInfo.pageSize,
      })
    );
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ currentPage: 1 }));
    dispatch(getUsers({ currentPage: 1, search: value }));
  };

  const handleRoleFilter = (value) => {
    dispatch(setFilters({ role: value }));
    dispatch(setPagination({ currentPage: 1 }));
    dispatch(getUsers({ currentPage: 1, role: value }));
  };

  const handleStatusFilter = (value) => {
    dispatch(setFilters({ status: value }));
    dispatch(setPagination({ currentPage: 1 }));
    dispatch(getUsers({ currentPage: 1, status: value }));
  };

  return (
    <div className='bg-white rounded-lg shadow px-6 py-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold'>{t('management.menu.user')}</h2>
      </div>

      <div className='flex gap-4 mb-4'>
        <Search placeholder={t('common.search')} allowClear style={{ width: 300 }} onSearch={handleSearch} loading={loading} />
        <Select placeholder={t('common.filter')} style={{ width: 150 }} allowClear onChange={handleRoleFilter} value={filters.role}>
          <Option value='Admin'>Admin</Option>
          <Option value='Moderator'>Moderator</Option>
          <Option value='User'>User</Option>
        </Select>
        <Select placeholder={t('common.filter')} style={{ width: 150 }} allowClear onChange={handleStatusFilter} value={filters.status}>
          <Option value='Active'>Active</Option>
          <Option value='Inactive'>Inactive</Option>
        </Select>
      </div>

      <Table
        columns={getColumns(t)}
        dataSource={users}
        loading={loading}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${t('pagination.items')} ${range[0]}-${range[1]} ${t('pagination.of')} ${total}`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        className='custom-ant-table'
        rowKey='id'
      />
    </div>
  );
}
