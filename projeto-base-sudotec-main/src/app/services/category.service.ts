import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '@/models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl: string = 'http://localhost:3000/categories';
    private http = inject(HttpClient);

    /**
     * Lista todas as categorias
     */
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl);
    }

    /**
     * Busca uma categoria por ID
     */
    getCategoryById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria uma nova categoria
     */
    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, category);
    }

    /**
     * Atualiza uma categoria
     */
    updateCategory(id: number, category: Category): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
    }

    /**
     * Deleta uma categoria
     */
    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
