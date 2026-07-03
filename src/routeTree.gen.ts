/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as ResetPasswordRouteImport } from './routes/reset-password'
import { Route as AuthenticatedRouteImport } from './routes/_authenticated/route'
import { Route as AuthenticatedIndexRouteImport } from './routes/_authenticated/index'
import { Route as AuthenticatedDashboardRouteImport } from './routes/_authenticated/dashboard'
import { Route as AuthenticatedBatchesRouteImport } from './routes/_authenticated/batches'
import { Route as AuthenticatedProductionRouteImport } from './routes/_authenticated/production'
import { Route as AuthenticatedSalesRouteImport } from './routes/_authenticated/sales'
import { Route as AuthenticatedCustomersRouteImport } from './routes/_authenticated/customers'
import { Route as AuthenticatedEmployeesRouteImport } from './routes/_authenticated/employees'
import { Route as AuthenticatedInventoryRouteImport } from './routes/_authenticated/inventory'
import { Route as AuthenticatedExpensesRouteImport } from './routes/_authenticated/expenses'
import { Route as AuthenticatedReportsRouteImport } from './routes/_authenticated/reports'
import { Route as AuthenticatedUsersRouteImport } from './routes/_authenticated/users'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const AuthRoute = AuthRouteImport.update({ id: '/auth', path: '/auth', getParentRoute: () => rootRouteImport } as any)
const ResetPasswordRoute = ResetPasswordRouteImport.update({ id: '/reset-password', path: '/reset-password', getParentRoute: () => rootRouteImport } as any)
const AuthenticatedRoute = AuthenticatedRouteImport.update({ id: '/_authenticated', getParentRoute: () => rootRouteImport } as any)
const AuthenticatedIndexRoute = AuthenticatedIndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => AuthenticatedRoute } as any)
const mk = (imp, path) => imp.update({ id: path, path, getParentRoute: () => AuthenticatedRoute } as any)
const AuthenticatedDashboardRoute = mk(AuthenticatedDashboardRouteImport, '/dashboard')
const AuthenticatedBatchesRoute = mk(AuthenticatedBatchesRouteImport, '/batches')
const AuthenticatedProductionRoute = mk(AuthenticatedProductionRouteImport, '/production')
const AuthenticatedSalesRoute = mk(AuthenticatedSalesRouteImport, '/sales')
const AuthenticatedCustomersRoute = mk(AuthenticatedCustomersRouteImport, '/customers')
const AuthenticatedEmployeesRoute = mk(AuthenticatedEmployeesRouteImport, '/employees')
const AuthenticatedInventoryRoute = mk(AuthenticatedInventoryRouteImport, '/inventory')
const AuthenticatedExpensesRoute = mk(AuthenticatedExpensesRouteImport, '/expenses')
const AuthenticatedReportsRoute = mk(AuthenticatedReportsRouteImport, '/reports')
const AuthenticatedUsersRoute = mk(AuthenticatedUsersRouteImport, '/users')

const authChildren = {
  AuthenticatedIndexRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedBatchesRoute,
  AuthenticatedProductionRoute,
  AuthenticatedSalesRoute,
  AuthenticatedCustomersRoute,
  AuthenticatedEmployeesRoute,
  AuthenticatedInventoryRoute,
  AuthenticatedExpensesRoute,
  AuthenticatedReportsRoute,
  AuthenticatedUsersRoute,
}
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(authChildren)

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/auth': { id: '/auth'; path: '/auth'; fullPath: '/auth'; preLoaderRoute: typeof AuthRouteImport; parentRoute: typeof rootRouteImport }
    '/reset-password': { id: '/reset-password'; path: '/reset-password'; fullPath: '/reset-password'; preLoaderRoute: typeof ResetPasswordRouteImport; parentRoute: typeof rootRouteImport }
    '/_authenticated': { id: '/_authenticated'; path: ''; fullPath: ''; preLoaderRoute: typeof AuthenticatedRouteImport; parentRoute: typeof rootRouteImport }
    '/_authenticated/': { id: '/_authenticated/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof AuthenticatedIndexRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/dashboard': { id: '/_authenticated/dashboard'; path: '/dashboard'; fullPath: '/dashboard'; preLoaderRoute: typeof AuthenticatedDashboardRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/batches': { id: '/_authenticated/batches'; path: '/batches'; fullPath: '/batches'; preLoaderRoute: typeof AuthenticatedBatchesRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/production': { id: '/_authenticated/production'; path: '/production'; fullPath: '/production'; preLoaderRoute: typeof AuthenticatedProductionRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/sales': { id: '/_authenticated/sales'; path: '/sales'; fullPath: '/sales'; preLoaderRoute: typeof AuthenticatedSalesRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/customers': { id: '/_authenticated/customers'; path: '/customers'; fullPath: '/customers'; preLoaderRoute: typeof AuthenticatedCustomersRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/employees': { id: '/_authenticated/employees'; path: '/employees'; fullPath: '/employees'; preLoaderRoute: typeof AuthenticatedEmployeesRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/inventory': { id: '/_authenticated/inventory'; path: '/inventory'; fullPath: '/inventory'; preLoaderRoute: typeof AuthenticatedInventoryRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/expenses': { id: '/_authenticated/expenses'; path: '/expenses'; fullPath: '/expenses'; preLoaderRoute: typeof AuthenticatedExpensesRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/reports': { id: '/_authenticated/reports'; path: '/reports'; fullPath: '/reports'; preLoaderRoute: typeof AuthenticatedReportsRouteImport; parentRoute: typeof AuthenticatedRoute }
    '/_authenticated/users': { id: '/_authenticated/users'; path: '/users'; fullPath: '/users'; preLoaderRoute: typeof AuthenticatedUsersRouteImport; parentRoute: typeof AuthenticatedRoute }
  }
}

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/reset-password': typeof ResetPasswordRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/batches': typeof AuthenticatedBatchesRoute
  '/production': typeof AuthenticatedProductionRoute
  '/sales': typeof AuthenticatedSalesRoute
  '/customers': typeof AuthenticatedCustomersRoute
  '/employees': typeof AuthenticatedEmployeesRoute
  '/inventory': typeof AuthenticatedInventoryRoute
  '/expenses': typeof AuthenticatedExpensesRoute
  '/reports': typeof AuthenticatedReportsRoute
  '/users': typeof AuthenticatedUsersRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/reset-password': typeof ResetPasswordRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/_authenticated/': typeof AuthenticatedIndexRoute
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRoute
  '/_authenticated/batches': typeof AuthenticatedBatchesRoute
  '/_authenticated/production': typeof AuthenticatedProductionRoute
  '/_authenticated/sales': typeof AuthenticatedSalesRoute
  '/_authenticated/customers': typeof AuthenticatedCustomersRoute
  '/_authenticated/employees': typeof AuthenticatedEmployeesRoute
  '/_authenticated/inventory': typeof AuthenticatedInventoryRoute
  '/_authenticated/expenses': typeof AuthenticatedExpensesRoute
  '/_authenticated/reports': typeof AuthenticatedReportsRoute
  '/_authenticated/users': typeof AuthenticatedUsersRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/auth' | '/reset-password' | '/dashboard' | '/batches' | '/production' | '/sales' | '/customers' | '/employees' | '/inventory' | '/expenses' | '/reports' | '/users'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/auth' | '/reset-password' | '/dashboard' | '/batches' | '/production' | '/sales' | '/customers' | '/employees' | '/inventory' | '/expenses' | '/reports' | '/users'
  id: '__root__' | '/' | '/auth' | '/reset-password' | '/_authenticated' | '/_authenticated/' | '/_authenticated/dashboard' | '/_authenticated/batches' | '/_authenticated/production' | '/_authenticated/sales' | '/_authenticated/customers' | '/_authenticated/employees' | '/_authenticated/inventory' | '/_authenticated/expenses' | '/_authenticated/reports' | '/_authenticated/users'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthRoute: typeof AuthRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
}

const rootChildren: RootRouteChildren = {
  IndexRoute,
  AuthRoute,
  ResetPasswordRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
}

export const routeTree = rootRouteImport._addFileChildren(rootChildren)._addFileTypes<FileRouteTypes>()
