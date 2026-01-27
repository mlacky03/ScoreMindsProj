
import { Repository, ObjectLiteral, DeepPartial, SelectQueryBuilder, In } from 'typeorm';
import { BaseMapper } from '../mappers/base.mapper';
export interface PagginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export interface SearchOptions {
    search: string[];
    searchTherm?: string;
}


export abstract class BaseRepository<TDomain, TEntity extends ObjectLiteral> {

    constructor(
        protected readonly typeOrmRepo: Repository<TEntity>,
        protected readonly mapper: BaseMapper<TDomain, TEntity>
    ) { }

    async save(domainItem: TDomain): Promise<TDomain> {

        const entity = this.mapper.toPersistence(domainItem);

        const savedEntity = await this.typeOrmRepo.save(entity as DeepPartial<TEntity>);

        return this.mapper.toDomain(savedEntity as TEntity);
    }

    async findById(id: any): Promise<TDomain | null> {
        const entity = await this.typeOrmRepo.findOne({ where: { id } as any });
        if (!entity) return null;

        return this.mapper.toDomain(entity);
    }

    async findAll(): Promise<TDomain[]> {
        const entities = await this.typeOrmRepo.find();
        return this.mapper.toDomainList(entities);
    }

    async delete(id: any): Promise<void> {
        await this.typeOrmRepo.delete(id);
    }

    

    protected CreateBaseQueryBuilder(alias: string): SelectQueryBuilder<TEntity> {
        return this.typeOrmRepo.createQueryBuilder(alias);
    }

    protected applyPaggination(
        qb: SelectQueryBuilder<TEntity>,
        options: PagginationOptions = {}
    ) {
        const { page = 1, limit = 10, sort, order = 'DESC' } = options;
        qb.skip((page - 1) * limit).take(limit);

        if (sort) {
            qb.orderBy(`${qb.alias}.${sort}`, order);
        }

        return qb;
    }

    protected applySearch(
        qb: SelectQueryBuilder<TEntity>,
        options: SearchOptions
    ) {
        const { search, searchTherm = '' } = options;

        if (searchTherm && search.length > 0) {
            const searchconditions = search.map(filed => `${qb.alias}.${filed} LIKE :searchTherm`)
                .join(' OR ');
            qb.andWhere(`(${searchconditions})`, { searchTherm: `%${searchTherm}%` });
        }

        return qb;
    }

    protected async paginate(
        qb: SelectQueryBuilder<TEntity>,
        options: PagginationOptions = {}
    ): Promise<{ items: TEntity[]; total: number; page: number; totalPages: number }> {
        const { page = 1, limit = 10 } = options;

        const [items, total] = await qb.getManyAndCount();
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return {
            items,
            total,
            page,
            totalPages
        }
    }
}