import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timer, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, timeout } from 'rxjs/operators';
import { InventoryAuditEntry, InventoryItem, LowStockItem, StockBySize } from '../models/inventory.model';
import { FulfillRestockResponse, RestockRequest } from '../models/restock-request.model';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHealth(): Observable<{ ok: boolean; dbReady: boolean }> {
    return this.http.get<any>(`${this.baseUrl}/health`).pipe(
      map((h) => ({
        ok: typeof h?.ok === 'boolean' ? h.ok : h?.status === 'ok',
        dbReady: typeof h?.dbReady === 'boolean' ? h.dbReady : h?.mongodb === 'connected'
      })),
      catchError(() => of({ ok: false, dbReady: false }))
    );
  }

  waitForDbReady(maxWaitMs = 120000): Observable<void> {
    return timer(0, 1000).pipe(
      switchMap(() =>
        this.getHealth().pipe(
          catchError(() => of({ ok: false, dbReady: false }))
        )
      ),
      filter((h) => !!h.dbReady),
      take(1),
      timeout({ first: maxWaitMs }),
      map(() => void 0)
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/user/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/user/${id}`);
  }

  // Product-related API calls
  getProducts(params?: {
    q?: string;
    category?: string;
    sub_category?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: number;
    limit?: number;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params || {})) {
      if (value === undefined || value === null || value === '') continue;
      httpParams = httpParams.set(key, String(value));
    }
    console.log(`🌐 Fetching products from: ${this.baseUrl}/products`);
    return this.http.get<any[]>(`${this.baseUrl}/products`, { params: httpParams });
  }

  searchProducts(q: string, limit = 8): Observable<any[]> {
    const searchParams = new HttpParams()
      .set('q', q || '')
      .set('limit', String(limit));
    return this.http.get<any[]>(`${this.baseUrl}/products/search`, { params: searchParams });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`);
  }

  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    for (const f of files) formData.append('images', f);
    return this.http.post<{ urls: string[] }>(`${this.baseUrl}/uploads/images`, formData);
  }

  exportProductsCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/products/export/csv`, { responseType: 'blob' });
  }

  importProductsCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/products/import/csv`, formData);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  getCollectionsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/collections/type/${type}`);
  }

  getCollectionBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/collections/slug/${slug}`);
  }

  getAdminCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/admin/all`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
  }

  getAdminCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/collections/admin/all`);
  }

  createCollection(collection: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/collections`, collection);
  }

  updateCollection(id: string, collection: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/collections/${id}`, collection);
  }

  deleteCollection(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/collections/${id}`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }

  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/my-orders`);
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/${id}`);
  }

  downloadInvoice(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/orders/${id}/invoice`, { responseType: 'blob' });
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/orders/${id}/status`, { status });
  }

  processRefund(id: string, reason: string, amount?: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders/${id}/refund`, { reason, amount });
  }

  cancelOrder(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders/${id}/cancel`, {});
  }

  requestRefund(id: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders/${id}/request-refund`, { reason });
  }

  refundOrder(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders/${orderId}/refund`, {});
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/inventory`);
  }

  getLowStockInventory(): Observable<LowStockItem[]> {
    return this.http.get<LowStockItem[]>(`${this.baseUrl}/inventory/low-stock`);
  }

  restockInventory(
    inventoryId: string,
    payload: { add: Partial<StockBySize>; supplier?: string; supplier_email?: string; note?: string }
  ): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/inventory/${inventoryId}/restock`, payload);
  }

  adjustInventory(
    inventoryId: string,
    payload: { delta: Partial<StockBySize>; reason: string }
  ): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/inventory/${inventoryId}/adjust`, payload);
  }

  getInventoryHistory(inventoryId: string, limit = 50): Observable<InventoryAuditEntry[]> {
    return this.http.get<InventoryAuditEntry[]>(
      `${this.baseUrl}/inventory/${inventoryId}/history?limit=${encodeURIComponent(String(limit))}`
    );
  }

  createRestockRequest(payload: {
    inventoryId: string;
    requested_by_size: Partial<StockBySize>;
    supplier_name?: string;
    supplier_email?: string;
    note?: string;
  }): Observable<RestockRequest> {
    return this.http.post<RestockRequest>(`${this.baseUrl}/restock-requests`, payload);
  }

  listRestockRequests(status: 'pending' | 'fulfilled' | 'all' = 'all', limit = 50): Observable<RestockRequest[]> {
    return this.http.get<RestockRequest[]>(
      `${this.baseUrl}/restock-requests?status=${encodeURIComponent(status)}&limit=${encodeURIComponent(String(limit))}`
    );
  }

  getMyRestockRequests(): Observable<RestockRequest[]> {
    return this.http.get<RestockRequest[]>(`${this.baseUrl}/restock-requests/my`);
  }

  fulfillRestockRequest(code: string): Observable<FulfillRestockResponse> {
    return this.http.post<FulfillRestockResponse>(`${this.baseUrl}/restock-requests/fulfill`, { code });
  }

  listRestockRequestsForInventory(
    inventoryId: string,
    status: 'pending' | 'fulfilled' | 'cancelled' | 'expired' | 'all' = 'all',
    limit = 50
  ): Observable<RestockRequest[]> {
    return this.http.get<RestockRequest[]>(
      `${this.baseUrl}/restock-requests?inventoryId=${encodeURIComponent(inventoryId)}&status=${encodeURIComponent(
        status
      )}&limit=${encodeURIComponent(String(limit))}`
    );
  }

  cancelRestockRequest(
    requestId: string,
    reason = ''
  ): Observable<{ success: boolean; request: RestockRequest; emailStatus?: { attempted?: boolean; success?: boolean; skipped?: boolean; error?: string } }> {
    return this.http.post<{ success: boolean; request: RestockRequest; emailStatus?: { attempted?: boolean; success?: boolean; skipped?: boolean; error?: string } }>(
      `${this.baseUrl}/restock-requests/${requestId}/cancel`,
      { reason }
    );
  }

  getFinancials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/financials`);
  }

  getSalesTrends(days = 30): Observable<Array<{ date: string; revenue: number; orders: number }>> {
    return this.http.get<Array<{ date: string; revenue: number; orders: number }>>(
      `${this.baseUrl}/analytics/sales-trends?days=${encodeURIComponent(String(days))}`
    );
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`);
  }

  getSupplier(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/suppliers/${id}`);
  }

  createSupplier(data: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers`, data);
  }

  updateSupplier(id: string, data: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/suppliers/${id}`, data);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/suppliers/${id}`);
  }

  getGlobalInventoryHistory(limit: number): Observable<InventoryAuditEntry[]> {
    return this.http.get<InventoryAuditEntry[]>(`${this.baseUrl}/inventory/audit-log?limit=${limit}`);
  }

  exportSalesReport(format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/sales?format=${format}`, { responseType: 'blob' });
  }

  exportInventoryReport(format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/inventory?format=${format}`, { responseType: 'blob' });
  }

  exportCustomerReport(format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/customers?format=${format}`, { responseType: 'blob' });
  }

  exportMyReport(format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/my-report?format=${format}`, { responseType: 'blob' });
  }
}
