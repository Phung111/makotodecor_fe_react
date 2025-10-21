import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CLOTHSHOP_API_URL } from '../app/global';

const namespace = 'managementProductSlice';

// Real API functions
const productAPI = {
  getProducts: async (params) => {
    const { currentPage = 0, pageSize = 10, search = '', status = '' } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: currentPage,
      size: pageSize,
    });

    if (search) {
      queryParams.append('name', search);
    }

    if (status) {
      queryParams.append('status', status);
    }

    const response = await fetch(`${CLOTHSHOP_API_URL.PRODUCT.GET_PAGED}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform backend response to match frontend format
    const mapStatus = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'Đang bán';
        case 'INACTIVE':
          return 'Ngừng bán';
        case 'OUT_OF_STOCK':
          return 'Hết hàng';
        case 'DISCONTINUED':
          return 'Ngừng sản xuất';
        default:
          return 'N/A';
      }
    };

    return {
      data: data.items.map((item) => ({
        id: item.id,
        code: `SP${item.id}`,
        name: item.name,
        status: mapStatus(item.status),
        type: item.category?.name || 'N/A',
        updated: item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : 'N/A',
      })),
      totalElements: data.pageInfo.totalElements,
      totalPages: data.pageInfo.totalPages,
      currentPage: data.pageInfo.currentPage,
      pageSize: data.pageInfo.pageSize,
      isFirst: data.pageInfo.isFirst,
      isLast: data.pageInfo.isLast,
    };
  },

  createProduct: async (productData) => {
    const response = await fetch(CLOTHSHOP_API_URL.PRODUCT.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  updateProduct: async (id, productData) => {
    const response = await fetch(`${CLOTHSHOP_API_URL.PRODUCT.UPDATE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${CLOTHSHOP_API_URL.PRODUCT.DELETE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { id };
  },

  getProductById: async (id) => {
    const response = await fetch(`${CLOTHSHOP_API_URL.PRODUCT.GET_DETAIL}/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};

const initialState = {
  loading: false,
  products: [],
  currentProduct: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    isFirst: true,
    isLast: false,
  },
  filters: {
    search: '',
    status: '',
    type: '',
  },
  message: null,
};

// Async thunks
export const getProducts = createAsyncThunk(`${namespace}/getProducts`, async (params, { rejectWithValue, getState }) => {
  const paramsToUse = params || {};
  try {
    const { managementProductSlice } = getState();
    const finalParams = {
      currentPage: managementProductSlice.pagination.currentPage,
      pageSize: managementProductSlice.pagination.pageSize,
      search: managementProductSlice.filters.search,
      ...paramsToUse,
    };

    console.log('getProducts called with params:', finalParams);
    const response = await productAPI.getProducts(finalParams);
    console.log('getProducts response:', response);
    return response;
  } catch (error) {
    console.error('getProducts error:', error);
    return rejectWithValue(error.message || 'Có lỗi xảy ra khi tải danh sách sản phẩm');
  }
});

export const createProduct = createAsyncThunk(`${namespace}/createProduct`, async (productData, { rejectWithValue }) => {
  try {
    const response = await productAPI.createProduct(productData);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
  }
});

export const updateProduct = createAsyncThunk(`${namespace}/updateProduct`, async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await productAPI.updateProduct(id, data);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
  }
});

export const deleteProduct = createAsyncThunk(`${namespace}/deleteProduct`, async (id, { rejectWithValue }) => {
  try {
    await productAPI.deleteProduct(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
  }
});

export const getProductById = createAsyncThunk(`${namespace}/getProductById`, async (id, { rejectWithValue }) => {
  try {
    const response = await productAPI.getProductById(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || 'Có lỗi xảy ra khi tải thông tin sản phẩm');
  }
});

const managementProductSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        console.log('getProducts.fulfilled - action.payload:', action.payload);
        state.loading = false;
        state.products = action.payload.data;
        state.pagination.totalElements = action.payload.totalElements;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.currentPage = action.payload.currentPage;
        state.pagination.pageSize = action.payload.pageSize;
        state.pagination.isFirst = action.payload.isFirst;
        state.pagination.isLast = action.payload.isLast;
        console.log('getProducts.fulfilled - state.products:', state.products);
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: 'error', text: action.payload };
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.message = { type: 'success', text: 'Tạo sản phẩm thành công' };
        // Refresh products list
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: 'error', text: action.payload };
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.message = { type: 'success', text: 'Cập nhật sản phẩm thành công' };
        // Update product in list
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: 'error', text: action.payload };
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.message = { type: 'success', text: 'Xóa sản phẩm thành công' };
        // Remove product from list
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: 'error', text: action.payload };
      })

      // Get Product By ID
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: 'error', text: action.payload };
      });
  },
});

export const { setPagination, setFilters, clearMessage, clearCurrentProduct } = managementProductSlice.actions;

export default managementProductSlice.reducer;
