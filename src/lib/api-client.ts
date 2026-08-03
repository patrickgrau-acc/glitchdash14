export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

class ApiClient {
  private async request<T>(method: string, path: string, body?: unknown, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);
      let responseData: any;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      if (!res.ok) {
        throw {
          status: res.status,
          message: responseData?.message || res.statusText,
          detail: responseData?.detail || JSON.stringify(responseData),
        } as ApiError;
      }

      return {
        data: responseData,
        status: res.status,
      };
    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      throw {
        status: 500,
        message: err.message || 'Network error',
      } as ApiError;
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient();
