import express, { Router } from 'express';

import commands from './commands';
import timers from './timers';
import users from './users';
import settings from './settings';
import events from './events';
import eventlist from './eventlist';
import keywords from './keywords';
import variables from './variables';
import greetings from './greetings';
import overlays from './overlays';
import widgets from './widgets';
import chatMessage from './chatMessage';
import files from './files';

const router = Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get('/', (req, res) => {
  res.send('This is api v1');
});

router.use('/commands', commands);
router.use('/timers', timers);
router.use('/users', users);
router.use('/settings', settings);
router.use('/events', events);
router.use('/eventlist', eventlist);
router.use('/keywords', keywords);
router.use('/variables', variables);
router.use('/greetings', greetings);
router.use('/overlays', overlays);
router.use('/widgets', widgets);
router.use('/chatMessage', chatMessage);
router.use('/files', files);

export default router;
