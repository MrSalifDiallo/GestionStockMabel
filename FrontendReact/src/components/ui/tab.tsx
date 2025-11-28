import axiosInstance from '@/config/config.axios';
import { formatCurrency } from '@/lib/utils.format';
import { Product } from '@/services/services.products';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Search, Table, ImageIcon, Badge, Edit, Trash2 } from 'lucide-react';
import React from 'react'
import { Button } from 'react-day-picker';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Input } from './input';
import { Pagination } from './pagination';
import { Skeleton } from './skeleton';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';

export default function tab() {
  return (
    <div>
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <CardTitle>Catalogue Produits</CardTitle>
                <div className="flex gap-2 w-full md:w-auto flex-wrap">
                    <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                    <Select value={filterCategory || "all"} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {categories.map((cat) => (
                        <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                            {cat.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="ok">En stock</SelectItem>
                        <SelectItem value="warning">Alerte</SelectItem>
                        <SelectItem value="danger">Rupture</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Coût</TableHead>
                    <TableHead>Marge</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                        <TableCell><Skeleton className="h-12 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                    ))
                    ) : filteredProducts.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun produit trouvé
                        </TableCell>
                    </TableRow>
                    ) : (
                    paginatedProducts.map((product: Product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                            {(product as any).image ? (
                            <img
                                src={(product as any).image_url || `${axiosInstance.defaults.baseURL?.replace('/api', '')}/storage/${(product as any).image}`}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover bg-muted"
                                onError={(e) => {
                                // Si l'image ne charge pas, afficher l'icône
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                }
                                }}
                            />
                            ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{product.category?.name || "N/A"}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                            {formatCurrency(product.prix_vente)}
                        </TableCell>
                        <TableCell>{formatCurrency(product.prix_achat)}</TableCell>
                        <TableCell>
                        <span className="text-success font-semibold">
                            +{calculateMargin(product.prix_vente, product.prix_achat)}%
                        </span>
                        </TableCell>
                        <TableCell>
                        <span
                            className={
                                product.stock <= product.min_stock_alert ? "text-destructive font-bold" : ""
                            }
                        >
                            {product.stock}
                        </span>
                        </TableCell>
                        <TableCell>{getStockBadge(product)}</TableCell>
                        <TableCell>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(product)}
                            >
                            <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                disabled={deleteMutation.isPending}
                            >
                            <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
                {filteredProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    lastPage={totalPages}
                    perPage={perPage}
                    total={filteredProducts.length}
                    onPageChange={setCurrentPage}
                    onPerPageChange={(newPerPage) => {
                    setPerPage(newPerPage);
                    setCurrentPage(1);
                    }}
                />
                )}
            </CardContent>
        </Card>
    </div>
  )
}
