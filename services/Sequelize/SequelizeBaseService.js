class SequelizeBaseService {
    constructor(entityType){
        this.entityType = entityType
        console.log(this.entityType)
    }

    async getAll(includes=[]){
        const entities = await this.entityType.findAll({ include:includes})
        return entities
    }

    async getById(id,includes=[]){
        const entity = await this.entityType.findOne({
            where:{
                id:id
            },
            include: includes
        })
        return entity
    }

    async getFiltered(filter, includes=[]){
        const entity = await this.entityType.findAll({
            where:filter,
            include: includes
        })
        return entity
    }

    async getFiltered(filter, includes=[]){
        const entity = await this.entityType.findAll({
            where:filter,
            include: includes
        })
        return entity
    }

    async getOneFiltered(filter, includes=[]){
        const entity = await this.entityType.findOne({
            where:filter,
            include: includes
        })
        return entity
    }

    async add(entity){
        const addedEntity = await this.entityType.create(entity)
        return addedEntity
    }

    async update(entity, filter=null){
        const updatedEntity = await this.entityType.update(entity, {
            where:{
                id:entity.id,
                ...filter
            }
        })
        return updatedEntity
    }

    async delete(id, filter=null){
        const result = await this.entityType.destroy({
            where:{
                id:id,
                ...filter
            }
        }) 
        return result
    }

    

}

module.exports = SequelizeBaseService