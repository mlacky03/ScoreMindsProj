
export abstract class BaseMapper<DomainModel, Entity> {
    
    
    abstract toDomain(entity: Entity): DomainModel;

    abstract toPersistence(domain: DomainModel): Entity;
    
    toDomainList(entities: Entity[]): DomainModel[] {
        return entities.map(e => this.toDomain(e));
    }

    toPersistenceList(domains: DomainModel[]): Entity[] {
        return domains.map(d => this.toPersistence(d));
    }
}