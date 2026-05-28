import { Folder, File } from '../models';

export const recursiveSoftDeleteFolder = async (folderId: string, userId: string) => {
  
  const getChildrenIds = async (id: string): Promise<string[]> => {
    const children = await Folder.findAll({ where: { parentId: id, userId } });
    const childrenIds = children.map(c => c.id);
    let allDescendants = [...childrenIds];
    
    for (const childId of childrenIds) {
      allDescendants = allDescendants.concat(await getChildrenIds(childId));
    }
    return allDescendants;
  };

  const allFolderIdsToDelete = [folderId, ...(await getChildrenIds(folderId))];

  
  await File.destroy({
    where: {
      folderId: allFolderIdsToDelete,
      userId,
    },
  });

 
  await Folder.destroy({
    where: {
      id: allFolderIdsToDelete,
      userId,
    },
  });
};
