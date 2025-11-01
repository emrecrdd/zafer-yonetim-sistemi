import { Notification, User } from '../models/index.js';
import { paginate, buildPagination } from '../utils/helpers.js';
import { Op } from 'sequelize';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    const whereConditions = { userId: req.user.id };

    if (unreadOnly === 'true') {
      whereConditions.isRead = false;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset
    });

    res.json(buildPagination(notifications, page, limit, count));

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Bildirimler getirilirken hata oluştu'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Bildirim bulunamadı'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Bildirim güncellenirken hata oluştu'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Bildirimler güncellenirken hata oluştu'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Bildirim bulunamadı'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Bildirim silindi'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Bildirim silinirken hata oluştu'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Okunmamış bildirim sayısı alınamadı'
    });
  }
};