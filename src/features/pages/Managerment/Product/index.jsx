import { Table, Tag, Button, Input, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getProducts, setPagination, setFilters, clearMessage } from '../../../../slice/managementProductSlice';

const { Search } = Input;
const { Option } = Select;

const getColumns = (t) => [
  {
    title: t('product.code'),
    dataIndex: 'code',
    key: 'code',
    render: (text) => <span className='font-semibold'>{text}</span>,
  },
  { title: t('product.name'), dataIndex: 'name', key: 'name' },
  {
    title: t('product.status'),
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const colorMap = {
        'Đang bán': 'green',
        'Ngừng bán': 'red',
        'Hết hàng': 'orange',
        'Ngừng sản xuất': 'default',
      };
      return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
    },
  },
  { title: t('product.category'), dataIndex: 'type', key: 'type' },
  { title: t('product.updated'), dataIndex: 'updated', key: 'updated' },
];

export default function Product() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { products, loading, pagination, filters, message: storeMessage } = useSelector((state) => state.managementProductSlice);

  console.log('Product component - products:', products);
  console.log('Product component - loading:', loading);
  console.log('Product component - pagination:', pagination);

  useEffect(() => {
    dispatch(getProducts({ currentPage: 0 }));
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
    // Convert 1-based Ant Design pagination to 0-based for backend
    const zeroBasedPage = paginationInfo.current - 1;

    const newPagination = {
      currentPage: zeroBasedPage,
      pageSize: paginationInfo.pageSize,
    };
    dispatch(setPagination(newPagination));
    dispatch(
      getProducts({
        currentPage: zeroBasedPage,
        pageSize: paginationInfo.pageSize,
      })
    );
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ currentPage: 0 }));
    dispatch(getProducts({ currentPage: 0, search: value }));
  };

  const handleStatusFilter = (value) => {
    dispatch(setFilters({ status: value }));
    dispatch(setPagination({ currentPage: 0 }));
    dispatch(getProducts({ currentPage: 0, status: value }));
  };

  return (
    <div className='bg-white rounded-lg shadow px-6 py-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold'>{t('management.menu.product')}</h2>
        <Button type='primary' className='font-semibold text-base px-5 py-2 rounded' onClick={() => navigate('/managerment/product/create')}>
          + {t('common.create')}
        </Button>
      </div>

      <div className='flex gap-4 mb-4'>
        <Search placeholder={t('common.search')} allowClear style={{ width: 300 }} onSearch={handleSearch} loading={loading} />
        <Select placeholder={t('common.filter')} style={{ width: 200 }} allowClear onChange={handleStatusFilter} value={filters.status}>
          <Option value='Đang bán'>Đang bán</Option>
          <Option value='Ngừng bán'>Ngừng bán</Option>
          <Option value='Hết hàng'>Hết hàng</Option>
          <Option value='Ngừng sản xuất'>Ngừng sản xuất</Option>
        </Select>
      </div>

      <Table
        columns={getColumns(t)}
        dataSource={products}
        loading={loading}
        pagination={{
          current: pagination.currentPage + 1, // Convert 0-based to 1-based for Ant Design
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
