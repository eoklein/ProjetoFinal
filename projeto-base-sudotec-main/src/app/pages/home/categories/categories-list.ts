import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoryService } from '@/services/category.service';
import { Category } from '@/models/category.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-categories-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './categories-list.html',
    providers: [MessageService, ConfirmationService]
})
export class CategoriesList implements OnInit {
    categoryService = inject(CategoryService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    categories: Category[] = [];
    categoryDialog: boolean = false;
    category: Category = {} as Category;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.loading = true;
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar categorias'
                });
                this.loading = false;
            }
        });
    }

    openNew() {
        this.category = {} as Category;
        this.submitted = false;
        this.isEditMode = false;
        this.categoryDialog = true;
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.isEditMode = true;
        this.categoryDialog = true;
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
    }

    saveCategory() {
        this.submitted = true;

        if (this.category.nome?.trim()) {
            if (this.category.id) {
                // Update
                this.categoryService.updateCategory(this.category.id, this.category).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Categoria atualizada com sucesso'
                        });
                        this.loadCategories();
                        this.categoryDialog = false;
                        this.category = {} as Category;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar categoria'
                        });
                    }
                });
            } else {
                // Create
                this.categoryService.createCategory(this.category).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Categoria criada com sucesso'
                        });
                        this.loadCategories();
                        this.categoryDialog = false;
                        this.category = {} as Category;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao criar categoria'
                        });
                    }
                });
            }
        }
    }

    confirmDelete(category: Category) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar a categoria "${category.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteCategory(category.id!);
            }
        });
    }

    deleteCategory(id: number) {
        this.categoryService.deleteCategory(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Categoria deletada com sucesso'
                });
                this.loadCategories();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar categoria'
                });
            }
        });
    }
}
