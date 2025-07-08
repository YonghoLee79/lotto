import pygame
import json
import datetime
from config import ACCESS_LEVELS, SUBSCRIPTION_UI_CONFIG

class SubscriptionUI:
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.font = pygame.font.Font(None, 32)
        self.small_font = pygame.font.Font(None, 24)
        self.subscription_level = 'FREE'
        self.session_count = 0
        self.last_popup_time = None
        
    def draw_subscription_banner(self, screen):
        """구독 배너 표시"""
        if self.subscription_level == 'FREE':
            banner_rect = pygame.Rect(0, 0, self.screen_width, 50)
            pygame.draw.rect(screen, (50, 50, 50), banner_rect)
            
            text = self.font.render("프리미엄 구독으로 업그레이드!", True, (255, 255, 255))
            screen.blit(text, (self.screen_width//2 - text.get_width()//2, 15))
            
    def draw_premium_badge(self, screen):
        """프리미엄 사용자 배지 표시"""
        if self.subscription_level != 'FREE':
            badge_text = f"{self.subscription_level} 사용자"
            text = self.small_font.render(badge_text, True, (255, 215, 0))
            screen.blit(text, (10, 10))
            
    def should_show_popup(self):
        """팝업 표시 여부 결정"""
        config = SUBSCRIPTION_UI_CONFIG['popup_timing']
        
        # 세션 시작 시
        if self.session_count == 0 and config['session_start']:
            return True
            
        # 시뮬레이션 횟수 기반
        if self.session_count % config['after_simulation'] == 0:
            return True
            
        # 시간 간격 기반
        if self.last_popup_time:
            days_passed = (datetime.datetime.now() - self.last_popup_time).days
            if days_passed >= config['interval_days']:
                return True
                
        return False
        
    def draw_subscription_popup(self, screen):
        """구독 팝업 표시"""
        if not self.should_show_popup():
            return
            
        # 팝업 배경
        popup_width = 600
        popup_height = 400
        x = (self.screen_width - popup_width) // 2
        y = (self.screen_height - popup_height) // 2
        
        popup_rect = pygame.Rect(x, y, popup_width, popup_height)
        pygame.draw.rect(screen, (255, 255, 255), popup_rect)
        pygame.draw.rect(screen, (0, 0, 0), popup_rect, 2)
        
        # 제목
        title = self.font.render("프리미엄 구독으로 업그레이드하세요!", True, (0, 0, 0))
        screen.blit(title, (x + (popup_width - title.get_width())//2, y + 20))
        
        # 구독 플랜 표시
        y_offset = y + 80
        for level, details in ACCESS_LEVELS.items():
            if level != 'FREE':
                plan_text = f"{level}: {details['price']}"
                text = self.small_font.render(plan_text, True, (0, 0, 0))
                screen.blit(text, (x + 20, y_offset))
                
                features = ", ".join(details['algorithms'])
                feature_text = self.small_font.render(f"기능: {features}", True, (0, 0, 0))
                screen.blit(feature_text, (x + 20, y_offset + 25))
                
                y_offset += 60
                
        # 구독 버튼
        button_rect = pygame.Rect(x + 200, y + popup_height - 60, 200, 40)
        pygame.draw.rect(screen, (0, 120, 255), button_rect)
        button_text = self.font.render("구독하기", True, (255, 255, 255))
        screen.blit(button_text, (button_rect.centerx - button_text.get_width()//2,
                                 button_rect.centery - button_text.get_height()//2))
                                 
        self.last_popup_time = datetime.datetime.now()
        
    def handle_subscription_click(self, pos):
        """구독 관련 클릭 처리"""
        popup_width = 600
        popup_height = 400
        x = (self.screen_width - popup_width) // 2
        y = (self.screen_height - popup_height) // 2
        
        button_rect = pygame.Rect(x + 200, y + popup_height - 60, 200, 40)
        
        if button_rect.collidepoint(pos):
            # 여기에 결제 처리 로직 추가
            pass
            
    def increment_session_count(self):
        """세션 카운트 증가"""
        self.session_count += 1
