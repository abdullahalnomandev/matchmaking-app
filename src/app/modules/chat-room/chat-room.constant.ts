export enum ChatRoomStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export const CHAT_ROOM_MESSAGES = {
  CREATED_SUCCESSFULLY: 'Chat room created successfully',
  UPDATED_SUCCESSFULLY: 'Chat room updated successfully',
  DELETED_SUCCESSFULLY: 'Chat room deleted successfully',
  FOUND_SUCCESSFULLY: 'Chat rooms retrieved successfully',
  NOT_FOUND: 'Chat room not found',
  ALREADY_EXISTS: 'Chat room with this name already exists',
  ACCESS_DENIED: 'Access denied to this chat room',
  INVALID_SUPPORT_AREA: 'Invalid support area specified'
} as const;
