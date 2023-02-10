const SequelizeBaseService = require('./SequelizeBaseService')
const { roles } = require('../../loaders').db

class RoleService extends SequelizeBaseService{
    constructor(){
        super(roles)
    }

    async addRoleToUser (roleName, user){
        const role = await this.getFiltered({ name: roleName })
        const isEmpty = Object.keys(role).length === 0
        if (isEmpty === true) {
            const addedRole = await this.entityType.create({
                name: roleName
            })
            await user.addRole(addedRole)
            return true
        }
        await user.addRole(role)
        return true
    }
}

module.exports = new RoleService()