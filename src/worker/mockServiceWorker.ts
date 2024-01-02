// this file exists for mocking out API queries in development

import { setupWorker } from 'msw/browser';
import { handlers } from '../handlers';

export var worker = setupWorker(...handlers);
