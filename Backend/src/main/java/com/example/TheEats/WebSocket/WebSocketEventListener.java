package com.example.TheEats.WebSocket;

import com.example.TheEats.objects.ChatMessage;
import com.example.TheEats.objects.MessageType;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    
    private final SimpMessageSendingOperations messageTemplate;
    
    public WebSocketEventListener(SimpMessageSendingOperations messageTemplate) {
        this.messageTemplate = messageTemplate;
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomID = (String)headerAccessor.getSessionAttributes().get("roomID");

        if (username != null && roomID != null) {
            System.out.println("Disconnected: " + username + " from room " + roomID);
            var chatmessage = ChatMessage.builder()
                .type(MessageType.LEAVER)
                .sender(username)
                .build();

            messageTemplate.convertAndSend("/topic/room/" + roomID, chatmessage);
        }
    }

    
}
