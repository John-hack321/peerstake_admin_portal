export interface UserData{
    id : number;
    username: string;
    phone_number: string;
    account_balance: number;
    no_of_stakes: number;
    no_of_pending_stakes: number;
}

export interface AllUsersApiResponse {
    page : number;
    limit : number;
    total : number;
    total_pages : number;
    has_next_page : boolean;
    users_data : UserData[];
}

export interface AllUsersReduxStoreInterface {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    data: UserData[];
    isLoading: boolean;
    hasReachedEnd: boolean;
}
