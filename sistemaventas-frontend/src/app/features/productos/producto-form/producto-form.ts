import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat, BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto, Categoria } from '../../../shared/models/models';

@Component({
    selector: 'app-producto-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ZXingScannerModule],
    templateUrl: './producto-form.html',
    styleUrls: ['./producto-form.css']
})
export class ProductoFormComponent implements OnInit {
    producto: Producto = {
        nombre: '',
        stock: 0,
        precioVenta: 0,
        urlImagen: '',
        categoria: undefined
    };
    categorias: Categoria[] = [];
    isEdit = false;
    showScanner = false;
    showScannerHelp = false;
    allowedFormats = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODABAR,
        BarcodeFormat.PDF_417,
        BarcodeFormat.AZTEC
    ];
    availableDevices: MediaDeviceInfo[] = [];
    currentDevice: MediaDeviceInfo | undefined;
    hasDevices = false;
    hasPermission = false;

    constructor(
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadCategorias();
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.productoService.getById(id).subscribe(data => {
                this.producto = data;
                // Ensure categoria is selected correctly based on ID comparison if objects are different instances
                if (this.producto.categoria && this.categorias.length > 0) {
                    const selectedCat = this.categorias.find(c => c.id === this.producto.categoria?.id);
                    if (selectedCat) {
                        this.producto.categoria = selectedCat;
                    }
                }
            });
        }
    }

    loadCategorias() {
        this.categoriaService.getAll().subscribe(data => {
            this.categorias = data;
            // Re-bind category if product was loaded before categories
            if (this.producto.categoria) {
                const selectedCat = this.categorias.find(c => c.id === this.producto.categoria?.id);
                if (selectedCat) {
                    this.producto.categoria = selectedCat;
                }
            }
        });
    }

    compareCategorias(c1: Categoria, c2: Categoria): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    toggleScanner() {
        this.showScanner = !this.showScanner;
        this.showScannerHelp = false; // Reset help when toggling
    }

    toggleScannerHelp() {
        this.showScannerHelp = !this.showScannerHelp;
    }

    onCamerasFound(devices: MediaDeviceInfo[]) {
        this.availableDevices = devices;
        this.hasDevices = Boolean(devices && devices.length);

        // Auto-select the first device (usually back camera on mobile or webcam on laptop)
        if (this.hasDevices) {
            this.currentDevice = devices[0];
        }
    }

    onCamerasNotFound() {
        this.toastService.show('No se encontraron cámaras en este dispositivo', 'error');
        this.hasDevices = false;
    }

    onScanError(error: any) {
        console.error(error);
        // Do not toast on every error as tryHarder causes many failed attempts before success
    }

    handleScanSuccess(resultString: string) {
        if (resultString) {
            this.producto.codigoBarras = resultString;
            this.showScanner = false;
            // Optional: Play beep sound
            const audio = new Audio('assets/beep.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        }
    }

    async onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e: any) => {
            const imageUrl = e.target.result;
            const codeReader = new BrowserMultiFormatReader();
            try {
                const result = await codeReader.decodeFromImageUrl(imageUrl);
                this.handleScanSuccess(result.getText());
                this.toastService.show('Código detectado correctamente', 'success');
            } catch (err) {
                console.error(err);
                if (err instanceof NotFoundException) {
                    this.toastService.show('No se encontró ningún código de barras en la imagen', 'info');
                } else {
                    this.toastService.show('Error al procesar la imagen', 'error');
                }
            }
        };
        reader.readAsDataURL(file);
    }

    onSubmit() {
        if (this.isEdit) {
            this.productoService.update(this.producto.id!, this.producto).subscribe(() => {
                this.router.navigate(['/productos']);
            });
        } else {
            this.productoService.create(this.producto).subscribe(() => {
                this.router.navigate(['/productos']);
            });
        }
    }
}
