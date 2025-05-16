import type {Product} from './product.interface';
import data from '../public/data.json'

export class DatabaseService {
	private db: IDBDatabase | null = null;
	private readonly DB_NAME = "ProductsDB";
	private readonly STORE_NAME = "products";

	constructor() {
		this.initDatabase();
	}
	public initDatabase(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.DB_NAME, 1);

			//handle any errors
			request.onerror = () => reject(request.error);

			//handle the success
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};
			//handle the upgrade needed event
			request.onupgradeneeded = (event) => {
				//the event is of type IDBVersionChangeEvent
				const db = (event.target as IDBOpenDBRequest).result;

				if (!db.objectStoreNames.contains(this.STORE_NAME)) {
					const store = db.createObjectStore(this.STORE_NAME, {
						keyPath: "id",
						autoIncrement: true,
					});
					store.createIndex("name", "name", { unique: false });
				}
			};
		});
	}
	//create the CRUD operatind for the products
	//update a product state
	async updateProduct(
		id: number,
		name: string,
		category: string,
		price: number,
        imageUrl: string,
        stock: number
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
			const store = transaction.objectStore(this.STORE_NAME);
			const request = store.get(id);

			request.onsuccess = () => {
				const data = request.result;
				if (data) {
					data.name = name;
					data.category = category;
					data.price = price;
                    data.imageUrl = imageUrl;
                    data.stock = stock;
					store.put(data);
					resolve();
				}
			};
			request.onerror = () => reject(request.error);
		});
	}
    //get all products from data.json file
    async getAllProducts(): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
async loadInitialData(): Promise<void> {
    const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
    const store = transaction.objectStore(this.STORE_NAME);
    const countRequest = store.count();

    return new Promise((resolve, reject) => {
        countRequest.onsuccess = async () => {
            if (countRequest.result === 0) {
                // Only load if store is empty
                const response = await fetch("../public/data.json"); // Adjust path as needed
                const products = await response.json();
                const tx = this.db!.transaction([this.STORE_NAME], "readwrite");
                const storeRW = tx.objectStore(this.STORE_NAME);
                products.forEach((product: Product) => storeRW.add(product));
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            } else {
                resolve();
            }
        };
        countRequest.onerror = () => reject(countRequest.error);
    });
}
    //update the stock number
    async updateStock(id: number, stock: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.stock = stock;
                    store.put(data);
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
}