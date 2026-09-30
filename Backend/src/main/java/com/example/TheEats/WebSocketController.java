package com.example.TheEats;

import com.example.TheEats.objects.ChatMessage;
import com.example.TheEats.persistence.DB;
import com.example.TheEats.business.PushMS;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final SimpMessageSendingOperations messageTemplate;
    private final DB repo;
    private final PushMS push;

    
    public WebSocketController(SimpMessageSendingOperations messageTemplate, DB sql, PushMS push) {
        this.messageTemplate = messageTemplate;
        this.repo = sql;
        this.push = push;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {
        String destination = "/topic/room/" + message.getRoomID();
        messageTemplate.convertAndSend(destination, message);
        repo.insertMessage(message.getSender(), message.getRoomID(), message.getContent(), false);
        push.sendExpoPush(message.getSender(), message.getContent(), message.getRoomID());
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String username = message.getSender();
        String roomID = message.getRoomID();
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("roomID", roomID);
        String destination = "/topic/room/" + roomID;
        System.out.println("Connected: " + username + " room: " + roomID);
        messageTemplate.convertAndSend(destination, message);
    }
}