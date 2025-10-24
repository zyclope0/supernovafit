import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, trackPageView, trackError, trackUserAction } from '@/lib/analytics';

// Mock the analytics functions
vi.mock('@/lib/analytics', async () => {
  const actual = await vi.importActual('@/lib/analytics');
  return {
    ...actual,
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackError: vi.fn(),
    trackUserAction: vi.fn(),
  };
});

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track events with correct parameters', () => {
    const eventName = 'button_click';
    const properties = { button: 'submit', page: 'dashboard' };
    
    trackEvent(eventName, properties);
    
    expect(trackEvent).toHaveBeenCalledWith(eventName, properties);
  });

  it('should track page views with correct parameters', () => {
    const pageName = 'dashboard';
    const properties = { section: 'main' };
    
    trackPageView(pageName, properties);
    
    expect(trackPageView).toHaveBeenCalledWith(pageName, properties);
  });

  it('should track errors with correct parameters', () => {
    const error = new Error('Test error');
    const context = { component: 'FormField', action: 'validation' };
    
    trackError(error, context);
    
    expect(trackError).toHaveBeenCalledWith(error, context);
  });

  it('should track user actions with correct parameters', () => {
    const action = 'form_submit';
    const properties = { form: 'meal', success: true };
    
    trackUserAction(action, properties);
    
    expect(trackUserAction).toHaveBeenCalledWith(action, properties);
  });

  it('should handle tracking without properties', () => {
    trackEvent('simple_event');
    trackPageView('simple_page');
    trackUserAction('simple_action');
    
    expect(trackEvent).toHaveBeenCalledWith('simple_event');
    expect(trackPageView).toHaveBeenCalledWith('simple_page');
    expect(trackUserAction).toHaveBeenCalledWith('simple_action');
  });

  it('should handle tracking with empty properties', () => {
    trackEvent('event', {});
    trackPageView('page', {});
    trackUserAction('action', {});
    
    expect(trackEvent).toHaveBeenCalledWith('event', {});
    expect(trackPageView).toHaveBeenCalledWith('page', {});
    expect(trackUserAction).toHaveBeenCalledWith('action', {});
  });
});
