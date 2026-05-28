import User from './User';
import Folder from './Folder';
import File from './File';
import ShareToken from './ShareToken';


User.hasMany(Folder, { foreignKey: 'userId', as: 'folders' });
Folder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(File, { foreignKey: 'userId', as: 'files' });
File.belongsTo(User, { foreignKey: 'userId', as: 'user' });


Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'children' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });

Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' });
File.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });


File.hasMany(ShareToken, { foreignKey: 'fileId', as: 'shares' });
ShareToken.belongsTo(File, { foreignKey: 'fileId', as: 'file' });

export { User, Folder, File, ShareToken };

