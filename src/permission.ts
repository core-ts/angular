import {storage} from './storage';
import {UserAccount} from './UserAccount';

export interface PermissionBuilder<T> {
  buildPermission(user: UserAccount, url: string): T;
}

export interface EditPermission {
  addable: boolean;
  editable: boolean;
  deletable?: boolean;
}

export interface SearchPermission {
  viewable?: boolean;
  addable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  approvable?: boolean;
}

export interface EditPermissionBuilder extends PermissionBuilder<EditPermission> {

}

export interface SearchPermissionBuilder extends PermissionBuilder<SearchPermission> {

}
export interface Editable  {
  addable: boolean;
  editable: boolean;
  deletable?: boolean;
}

export interface Searchable {
  viewable: boolean;
  addable: boolean;
  editable: boolean;
  approvable?: boolean;
  deletable?: boolean;
}

export function setSearchPermission(user: UserAccount, url: string, permissionBuilder: SearchPermissionBuilder, com: Searchable) {
  if (permissionBuilder) {
    const permission = permissionBuilder.buildPermission(storage.getUser(), url);
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}

export function setEditPermission(user: UserAccount, url: string, permissionBuilder: SearchPermissionBuilder, com: Editable) {
  if (permissionBuilder) {
    const permission = permissionBuilder.buildPermission(storage.getUser(), url);
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.deletable = permission.deletable;
  }
}
