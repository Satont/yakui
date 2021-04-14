import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { Variable } from '@bot/entities/Variable';
import variables from '@bot/systems/variables';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { RequestContext, wrap } from '@mikro-orm/core';

const router = Router({
  mergeParams: true,
});

router.get('/', async (req, res, next) => {
  try {
    const repository = RequestContext.getEntityManager().getRepository(Variable);

    res.json(await repository.findAll());
  } catch (e) {
    next(e);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    res.json(variables.variables);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const repository = RequestContext.getEntityManager().getRepository(Variable);
    const variable = await repository.findOne({ id: Number(req.params.id) });

    res.json(variable);
  } catch (e) {
    next(e);
  }
});

router.post('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
  name: {
    isString: true,
    in: ['body'],
  },
  enabled: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  response: {
    isString: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw();
    const body = req.body;

    const repository = RequestContext.getEntityManager().getRepository(Variable);
    const variable = body.id ? await repository.findOne(body.id) : repository.create(body);

    wrap(variable).assign({
      name: body.name,
      enabled: body.enabled,
      response: body.response,
    });

    await repository.persistAndFlush(variable);
    await variables.init();
    res.json(variable);
  } catch (e) {
    next(e);
  }
});

router.delete('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw();
    const repository = RequestContext.getEntityManager().getRepository(Variable);
    const variable = await repository.findOne(req.body.id);
    await repository.removeAndFlush(variable);

    await variables.init();
    res.send('Ok');
  } catch (e) {
    next(e);
  }
});


export default router;
