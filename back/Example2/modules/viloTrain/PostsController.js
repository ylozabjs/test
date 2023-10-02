const router = require('express').Router()

const actions = require('./actions')
const { BaseController } = require('../../rootcommmon/BaseController')

class EntityController extends BaseController {
  get router () {
    router.param('id', prepareEntityId)

    router.get('/entity', this.actionRunner(actions.ListEntityAction))
    router.get('/entity/:id', this.actionRunner(actions.GetEntityByIdAction))
    router.post('/entity', this.actionRunner(actions.CreateEntityEntityAction))
    router.patch('/entity/:id', this.actionRunner(actions.UpdateEntityEntityAction))
    router.delete('/entity/:id', this.actionRunner(actions.RemoveEntityAction))

    return router
  }

  async init () {
    this.logger.debug(`${this.constructor.name} initialized...`)
  }
}

function prepareEntityId (req, res, next) {
  const id = Number(req.params.id)
  if (id) req.params.id = id
  next()
}

module.exports = { EntityController }
