export class Request {
    id: string;
    type: string;
    employeeId: string;
    employee?: any;
    status: string;
    requestItems?: RequestItem[];
    items?: RequestItem[]; // For form handling
    isDeleting?: boolean;
}

export class RequestItem {
    name: string;
    quantity: number;
}