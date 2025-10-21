import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Upload, Image, InputNumber, Select, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import ImageUploader from '../../../components/Other/ImageUploader';
import { useTranslation } from '../../../../hooks/useTranslation';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ProductForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  // States
  const [defaultImage, setDefaultImage] = useState(null);
  const [prices, setPrices] = useState([]);
  const [colors, setColors] = useState([]);
  const [otherImages, setOtherImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Xác định đang ở view, edit hay create
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  // Handlers
  const handleEdit = () => navigate(`/product/edit/${id}`);
  const handleCancel = () => navigate(-1);

  // Price handlers
  const addPrice = () => {
    setPrices([...prices, { id: Date.now(), size: '', price: 0 }]);
  };

  const removePrice = (id) => {
    setPrices(prices.filter((p) => p.id !== id));
  };

  const updatePrice = (id, field, value) => {
    setPrices(prices.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Color handlers
  const addColor = () => {
    setColors([...colors, { id: Date.now(), name: '', colorCode: '#000000', image: null }]);
  };

  const removeColor = (id) => {
    setColors(colors.filter((c) => c.id !== id));
  };

  const updateColor = (id, field, value) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // Image handlers
  const handleDefaultImageUpload = (info) => {
    console.log('Default image upload info:', info);

    // Handle file selection using fileList
    if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      console.log('Selected file from fileList:', file);

      if (file) {
        // Create preview URL immediately
        const previewUrl = URL.createObjectURL(file);
        console.log('Preview URL created:', previewUrl);

        setDefaultImage({
          url: previewUrl,
          name: file.name,
          file: file,
        });
      }
    }
  };

  const handleColorImageUpload = (colorId, info) => {
    console.log('Color image upload info:', info);

    // Handle file selection using fileList
    if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      console.log('Selected color file from fileList:', file);

      if (file) {
        // Create preview URL immediately
        const previewUrl = URL.createObjectURL(file);
        console.log('Color preview URL created:', previewUrl);

        updateColor(colorId, 'image', {
          url: previewUrl,
          name: file.name,
          file: file,
        });
      }
    }
  };

  const handleDefaultImageRemove = () => {
    setDefaultImage(null);
  };

  const handleColorImageRemove = (colorId) => {
    updateColor(colorId, 'image', null);
  };

  // Form submission
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Validate required images
      if (!defaultImage) {
        message.error(t('product.form.requiredDefaultImage'));
        setLoading(false);
        return;
      }

      // Transform data to match API request format
      const requestData = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        status: values.status,
        discount: values.discount || 0,
        baseSold: values.baseSold || 0,
        defaultImage: {
          url: defaultImage.url, // This should be the Cloudinary URL after upload
          publicId: defaultImage.publicId || 'temp-id', // This should be the Cloudinary public ID
        },
        prices: prices
          .filter((p) => p.size && p.price > 0)
          .map((price) => ({
            size: price.size,
            price: price.price,
          })),
        colors: colors
          .filter((c) => c.name && c.colorCode)
          .map((color) => ({
            name: color.name,
            colorCode: color.colorCode,
            image: color.image
              ? {
                  url: color.image.url, // This should be the Cloudinary URL after upload
                  publicId: color.image.publicId || 'temp-id', // This should be the Cloudinary public ID
                }
              : null,
          })),
        otherImages: otherImages.map((img) => ({
          url: img.url, // This should be the Cloudinary URL after upload
          publicId: img.publicId || 'temp-id', // This should be the Cloudinary public ID
        })),
        detailImages: detailImages.map((img) => ({
          url: img.url, // This should be the Cloudinary URL after upload
          publicId: img.publicId || 'temp-id', // This should be the Cloudinary public ID
        })),
      };

      console.log('Request Data to be sent:', JSON.stringify(requestData, null, 2));

      // TODO: Replace with actual API call
      // const response = await createProduct(requestData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(t('product.form.createSuccess'));
      navigate('/managerment/product');
    } catch (error) {
      message.error(t('product.form.createError'));
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test function for debugging
  const testImageUpload = () => {
    console.log('Testing image upload...');
    console.log('Current otherImages:', otherImages);
    console.log('Current detailImages:', detailImages);
  };

  // Load categories on component mount
  useEffect(() => {
    // TODO: Replace with actual API call to get categories
    // const loadCategories = async () => {
    //   const response = await getCategories();
    //   setCategories(response.data);
    // };
    // loadCategories();

    // Mock categories for now
    setCategories([
      { id: 1, name: 'Áo thun' },
      { id: 2, name: 'Quần jean' },
      { id: 3, name: 'Váy' },
      { id: 4, name: 'Áo khoác' },
    ]);
  }, []);

  // Debug logging for defaultImage
  useEffect(() => {
    console.log('ProductForm - defaultImage state changed:', defaultImage);
  }, [defaultImage]);

  return (
    <div className='pb-20'>
      <Form form={form} layout='vertical' onFinish={handleSubmit} disabled={isView}>
        {/* 1. Thông tin cơ bản */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.form.basicInfo')}</h3>
          <div className='grid grid-cols-2 gap-4'>
            <Form.Item name='name' label={t('product.name')} rules={[{ required: true, message: t('product.form.requiredName') }]}>
              <Input placeholder={t('product.form.namePlaceholder')} />
            </Form.Item>

            <Form.Item name='categoryId' label={t('product.category')} rules={[{ required: true, message: t('product.form.requiredCategory') }]}>
              <Select placeholder={t('product.form.categoryPlaceholder')}>
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name='status' label={t('product.status')} rules={[{ required: true, message: t('product.form.requiredStatus') }]}>
              <Select placeholder={t('product.form.statusPlaceholder')}>
                <Option value='ACTIVE'>{t('product.statusOptions.active')}</Option>
                <Option value='INACTIVE'>{t('product.statusOptions.inactive')}</Option>
              </Select>
            </Form.Item>

            <Form.Item name='discount' label={t('product.discount')}>
              <InputNumber placeholder={t('product.form.discountPlaceholder')} min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name='baseSold' label={t('product.baseSold')}>
              <InputNumber placeholder={t('product.form.baseSoldPlaceholder')} min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </div>

        {/* 2. Ảnh mặc định */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.defaultImage')}</h3>
          <div className='flex gap-4'>
            {/* Chỉ hiển thị Upload khi chưa có ảnh */}
            {!defaultImage && (
              <Upload
                name='defaultImage'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleDefaultImageUpload}
                accept='image/*'
                maxCount={1}
                multiple={false}
                disabled={false}
                autoUpload={false}
                customRequest={({ file, onSuccess }) => {
                  console.log('Custom request called with file:', file);
                  // Simulate success immediately
                  setTimeout(() => {
                    onSuccess('ok');
                  }, 0);
                }}
                onRemove={() => {
                  console.log('Remove called');
                  handleDefaultImageRemove();
                }}
                onDrop={(e) => {
                  console.log('Drop event:', e);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const file = files[0];
                    console.log('Dropped file:', file);
                    const previewUrl = URL.createObjectURL(file);
                    setDefaultImage({
                      url: previewUrl,
                      name: file.name,
                      file: file,
                    });
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  console.log('Drag over event');
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  console.log('Drag enter event');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  console.log('Drag leave event');
                }}
                onError={(error) => {
                  console.error('Upload error:', error);
                }}
                onSuccess={(response, file) => {
                  console.log('Upload success:', response, file);
                }}
                onProgress={(percent, file) => {
                  console.log('Upload progress:', percent, file);
                }}
                onStart={(file) => {
                  console.log('Upload start:', file);
                }}
                onEnd={(file) => {
                  console.log('Upload end:', file);
                }}
                onAbort={(file) => {
                  console.log('Upload abort:', file);
                }}
                onReject={(file) => {
                  console.log('Upload reject:', file);
                }}
                onSelect={(file) => {
                  console.log('File selected:', file);
                }}
                onUnselect={(file) => {
                  console.log('File unselected:', file);
                }}
                onExpand={(file) => {
                  console.log('File expanded:', file);
                }}
                onCollapse={(file) => {
                  console.log('File collapsed:', file);
                }}
                onSearch={(value) => {
                  console.log('Search value:', value);
                }}
                onSort={(files) => {
                  console.log('Files sorted:', files);
                }}
                onFilter={(files) => {
                  console.log('Files filtered:', files);
                  return files;
                }}
                onDownload={(file) => {
                  console.log('File download:', file);
                  // Create a download link
                  const link = document.createElement('a');
                  link.href = file.url || file.thumbUrl;
                  link.download = file.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                onOpenChange={(open) => {
                  console.log('Open state changed:', open);
                }}
                onVisibleChange={(visible) => {
                  console.log('Visible state changed:', visible);
                }}
                onMouseEnter={(e) => {
                  console.log('Mouse enter event:', e);
                }}
                onMouseLeave={(e) => {
                  console.log('Mouse leave event:', e);
                }}
                onClick={(e) => {
                  console.log('Click event:', e);
                }}
                onDoubleClick={(e) => {
                  console.log('Double click event:', e);
                }}
                onContextMenu={(e) => {
                  console.log('Context menu event:', e);
                }}
                onKeyDown={(e) => {
                  console.log('Key down event:', e);
                }}
                onKeyUp={(e) => {
                  console.log('Key up event:', e);
                }}
                onKeyPress={(e) => {
                  console.log('Key press event:', e);
                }}
                onFocus={(e) => {
                  console.log('Focus event:', e);
                }}
                onBlur={(e) => {
                  console.log('Blur event:', e);
                }}
                onInput={(e) => {
                  console.log('Input event:', e);
                }}
                onSubmit={(file) => {
                  console.log('Submit event:', file);
                }}
                onCancel={(file) => {
                  console.log('Cancel event:', file);
                }}
                onRetry={(file) => {
                  console.log('Retry event:', file);
                }}
                onAccept={(file) => {
                  console.log('Accept event:', file);
                }}
                onDropReject={(file) => {
                  console.log('Drop reject event:', file);
                }}
                onDropComplete={(file) => {
                  console.log('Drop complete event:', file);
                }}
                onDropError={(file) => {
                  console.log('Drop error event:', file);
                }}
                onDropSuccess={(file) => {
                  console.log('Drop success event:', file);
                }}
                onDropProgress={(file) => {
                  console.log('Drop progress event:', file);
                }}
                onDropStart={(file) => {
                  console.log('Drop start event:', file);
                }}
                onDropEnd={(file) => {
                  console.log('Drop end event:', file);
                }}
                onDropAbort={(file) => {
                  console.log('Drop abort event:', file);
                }}
                onDropTimeout={(file) => {
                  console.log('Drop timeout event:', file);
                }}
                fileList={[]}
                onPreview={(file) => {
                  console.log('Preview file:', file);
                  // You can add a modal here to show full size image
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{t('product.uploadImage')}</div>
                </div>
              </Upload>
            )}

            {/* Hiển thị ảnh đã chọn với kích thước 100x100 */}
            {defaultImage && (
              <div className='flex flex-col items-center gap-2'>
                <div className='border-4 border-gray-300 rounded-lg overflow-hidden w-[108px] h-[108px] flex items-center justify-center'>
                  <Image
                    src={defaultImage.url}
                    alt={defaultImage.name}
                    width={100}
                    height={100}
                    className='object-cover w-full h-full m-0 p-0'
                    style={{ margin: 0, padding: 0 }}
                    fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN'
                  />
                </div>
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDefaultImageRemove}
                  size='small'
                  className='border-4 border-pink-200 rounded-lg w-[108px]'
                  style={{
                    border: '4px solid #fecaca',
                    borderRadius: '8px',
                    width: '108px',
                    height: '38px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fef2f2';
                    e.target.style.color = '#ef4444';
                  }}
                >
                  {t('product.removeImage')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Cấu hình giá */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.form.priceConfig')}</h3>
          <div className='space-y-4'>
            {prices.map((price, index) => (
              <div key={price.id} className='flex gap-4 items-center'>
                <div className='w-1/3'>
                  <Input
                    placeholder={t('product.form.sizePlaceholder')}
                    value={price.size}
                    onChange={(e) => updatePrice(price.id, 'size', e.target.value)}
                  />
                </div>
                <div className='w-1/3'>
                  <InputNumber
                    placeholder={t('product.form.pricePlaceholder')}
                    value={price.price}
                    onChange={(value) => updatePrice(price.id, 'price', value)}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className='w-1/3'>
                  <Button type='text' danger icon={<DeleteOutlined />} onClick={() => removePrice(price.id)} />
                </div>
              </div>
            ))}
            <Button type='dashed' onClick={addPrice} block icon={<PlusOutlined />}>
              {t('product.addPrice')}
            </Button>
          </div>
        </div>

        {/* 4. Cấu hình màu */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.form.colorConfig')}</h3>
          <div className='space-y-4'>
            {colors.map((color, index) => (
              <div key={color.id} className='flex gap-4 items-center p-4 border border-gray-100 rounded-lg bg-gray-50'>
                <div className='w-[30%]'>
                  <Input
                    placeholder={t('product.form.colorNamePlaceholder')}
                    value={color.name}
                    onChange={(e) => updateColor(color.id, 'name', e.target.value)}
                    className='h-14'
                    style={{ height: '53px' }}
                  />
                </div>
                <div className='w-[20%] flex justify-start'>
                  <div className='w-[60px] h-[60px] rounded-lg overflow-hidden'>
                    <input
                      type='color'
                      value={color.colorCode}
                      onChange={(e) => updateColor(color.id, 'colorCode', e.target.value)}
                      className='cursor-pointer w-full h-full border-none outline-none appearance-none p-0 m-0 block'
                    />
                  </div>
                </div>
                <div className='w-[25%] flex justify-start items-center'>
                  <div className='flex gap-2 items-center justify-start'>
                    {/* Chỉ hiển thị Upload khi chưa có ảnh màu */}
                    {!color.image && (
                      <Upload
                        name='colorImage'
                        listType='picture-card'
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={(info) => handleColorImageUpload(color.id, info)}
                        accept='image/*'
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>{t('product.colorImage')}</div>
                        </div>
                      </Upload>
                    )}

                    {/* Hiển thị ảnh màu đã chọn với kích thước 100x100 */}
                    {color.image && (
                      <div
                        className='border-4 border-gray-300 rounded-lg overflow-hidden w-[108px] h-[108px] flex items-center justify-center shadow-lg'
                        style={{ boxShadow: '4px -4px 8px rgba(0, 0, 0, 0.3)' }}
                      >
                        <Image
                          src={color.image.url}
                          alt={color.image.name}
                          width={100}
                          height={100}
                          className='object-cover w-full h-full m-0 p-0'
                          style={{ margin: 0, padding: 0 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className='w-[25%] flex flex-col gap-2 items-end justify-end'>
                  {/* Nút xóa ảnh */}
                  {color.image && (
                    <Button
                      type='text'
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleColorImageRemove(color.id)}
                      size='small'
                      className='border-4 border-pink-200 rounded-lg w-[108px]'
                      style={{
                        border: '4px solid #fecaca',
                        borderRadius: '8px',
                        width: '108px',
                        height: '38px',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.color = '#ef4444';
                      }}
                    >
                      {t('product.removeImage')}
                    </Button>
                  )}

                  {/* Nút xóa dòng */}
                  <Button
                    type='text'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeColor(color.id)}
                    size='small'
                    className='border-4 border-yellow-200 rounded-lg w-[108px]'
                    style={{
                      border: '4px solid #fef3c7',
                      borderRadius: '8px',
                      width: '108px',
                      height: '38px',
                      backgroundColor: '#fefce8',
                      color: '#d97706',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#d97706';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fefce8';
                      e.target.style.color = '#d97706';
                    }}
                  >
                    {t('product.removeRow')}
                  </Button>
                </div>
              </div>
            ))}

            <div className='flex justify-center'>
              <Button
                type='dashed'
                icon={<PlusOutlined />}
                onClick={addColor}
                className='w-full h-12 text-gray-600 border-2 border-dashed border-gray-300 hover:border-gray-400'
              >
                {t('product.addColor')}
              </Button>
            </div>
          </div>
        </div>

        {/* 5. Ảnh khác */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.otherImages')}</h3>
          <ImageUploader images={otherImages} onImagesChange={setOtherImages} title='' maxImages={10} className='' />
        </div>

        {/* 6. Ảnh chi tiết */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.detailImages')}</h3>
          <ImageUploader images={detailImages} onImagesChange={setDetailImages} title='' maxImages={20} className='' />
        </div>

        {/* 7. Mô tả */}
        <div className='mb-6 border border-gray-200 rounded-lg p-6 bg-white'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>{t('product.description')}</h3>
          <Form.Item name='description' label={t('product.description')}>
            <TextArea rows={6} placeholder={t('product.form.descriptionPlaceholder')} />
          </Form.Item>
        </div>
      </Form>

      {/* Footer buttons */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #eee',
          padding: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}
      >
        {isView && (
          <Button type='primary' onClick={handleEdit}>
            {t('common.edit')}
          </Button>
        )}
        {isEdit && (
          <>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button type='primary' loading={loading} onClick={() => form.submit()}>
              {t('common.update')}
            </Button>
          </>
        )}
        {isCreate && (
          <>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button type='primary' loading={loading} onClick={() => form.submit()}>
              {t('common.create')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

ProductForm.propTypes = {
  mode: PropTypes.oneOf(['view', 'edit', 'create']).isRequired,
};
