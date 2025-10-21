import { Table, Tag, Input, Select, message } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getOrders, setPagination, setFilters, clearMessage, updateOrderStatus } from '../../../../slice/managementOrderSlice';

const { Search } = Input;
const { Option } = Select;

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã giao':
      return 'green';
    case 'Đang xử lý':
      return 'orange';
    case 'Đã hủy':
      return 'red';
    default:
      return 'blue';
  }
};

const getColumns = (t) => [
  { title: t('order.id'), dataIndex: 'id', key: 'id' },
  { title: t('order.customer'), dataIndex: 'customer', key: 'customer' },
  { title: t('order.total'), dataIndex: 'total', key: 'total' },
  {
    title: t('order.status'),
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
  },
  { title: t('order.updated'), dataIndex: 'updated', key: 'updated' },
];

export default function Order() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { orders, loading, pagination, filters, message: storeMessage } = useSelector((state) => state.managementOrderSlice);

  useEffect(() => {
    dispatch(getOrders({ currentPage: 1 }));
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
      getOrders({
        currentPage: paginationInfo.current,
        pageSize: paginationInfo.pageSize,
      })
    );
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ currentPage: 1 }));
    dispatch(getOrders({ currentPage: 1, search: value }));
  };

  const handleStatusFilter = (value) => {
    dispatch(setFilters({ status: value }));
    dispatch(setPagination({ currentPage: 1 }));
    dispatch(getOrders({ currentPage: 1, status: value }));
  };

  return (
    <div className='bg-white rounded-lg shadow px-6 py-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold'>{t('management.menu.order')}</h2>
      </div>

      <div className='flex gap-4 mb-4'>
        <Search placeholder={t('common.search')} allowClear style={{ width: 350 }} onSearch={handleSearch} loading={loading} />
        <Select placeholder={t('common.filter')} style={{ width: 200 }} allowClear onChange={handleStatusFilter} value={filters.status}>
          <Option value='Đang xử lý'>Đang xử lý</Option>
          <Option value='Đã giao'>Đã giao</Option>
          <Option value='Đã hủy'>Đã hủy</Option>
        </Select>
      </div>

      <Table
        columns={getColumns(t)}
        dataSource={orders}
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
