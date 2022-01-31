const express = require('express');
const router = express.Router();

const { ConversationMessageRepository } = require('../repositories');
const { conversationMessages } = require('../handlers');

exports.conversationMessagesRouting = (db, secret) => {
    const conversationMessageRepository
        = new ConversationMessageRepository(db, secret);

    router.post('/convo-message', conversationMessages
        .createUserConversationMessage(conversationMessageRepository));

    router.get('/convo-message', conversationMessages
        .getConversationMessages(conversationMessageRepository));

    router.get('/user-convo-message', conversationMessages
        .getUserConversationMessages(conversationMessageRepository));

    router.get('/convo-health-status', (req, res) => {
        res.status(200).json({ health: 'ok' });
    });

    return router;
};
