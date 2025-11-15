import {Repository, SelectQueryBuilder, ObjectLiteral} from "typeorm";

export interface PagginationOptions{
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export interface SearchOptions{
    search: string[];
    searchTherm?: string;
}

export abstract class BaseService<T extends ObjectLiteral> {
    constructor(protected readonly repository: Repository<T>) {}

    protected CreateBaseQueryBuilder(alias:string): SelectQueryBuilder<T>{
        return this.repository.createQueryBuilder(alias);
    }

    protected applyPaggination(
        qb:SelectQueryBuilder<T>,
        options:PagginationOptions={}
    ){
        const {page=1, limit=10, sort, order='DESC'}=options;
        qb.skip((page-1)*limit).take(limit);

        if(sort){
            qb.orderBy(`${qb.alias}.${sort}`, order);
        }
        
        return qb;
    }

    protected applySearch(
        qb:SelectQueryBuilder<T>,
        options:SearchOptions
    ){
        const {search, searchTherm=''}=options;
        
        if(searchTherm && search.length>0){
            const searchconditions=search.map(filed=>`${qb.alias}.${filed} LIKE :searchTherm`)
            .join(' OR ');
            qb.andWhere(`(${searchconditions})`, {searchTherm: `%${searchTherm}%`});
        }

        return qb;
    }

    protected async paginate(
        qb:SelectQueryBuilder<T>,
        options:PagginationOptions={}
    ) : Promise<{items:T[]; total:number;page:number;totalPages:number}> {
        const {page=1, limit=10}=options;

        const [items,total]=await qb.getManyAndCount();
        const totalPages=total === 0 ? 0 : Math.ceil(total / limit);

        return{
            items,
            total,
            page,
            totalPages
        }
    }
}