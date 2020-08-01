import convertExtensionDefault, * as convertExtension from './es5/index';
declare const convertExtensionWrapper: typeof convertExtensionDefault & convertExtension;
export = convertExtensionWrapper;
