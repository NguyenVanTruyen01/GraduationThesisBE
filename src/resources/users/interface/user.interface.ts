
export interface IUser{
    readonly email: any;
    readonly password: string;
    readonly user_avatar: string ;
    readonly user_id: string;
    readonly user_name: string ;
    readonly user_date_of_birth: string ;
    readonly user_CCCD: string ;
    readonly user_phone: string;
    readonly user_permanent_address: string;
    readonly user_temporary_address: string;
    readonly user_department: string;
    readonly user_faculty: string;
    readonly user_major: string;
    readonly role: string ;
    readonly user_status: boolean;
    readonly user_average_grade: number;
}
