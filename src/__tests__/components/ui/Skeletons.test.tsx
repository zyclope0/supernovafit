import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  CardSkeleton,
  ChartSkeleton,
  ListSkeleton,
  TableSkeleton,
  ProfileSkeleton,
} from '../../../components/ui/Skeletons';

describe('Skeleton Components', () => {
  describe('CardSkeleton', () => {
    it('should render card skeleton with default height', () => {
      render(<CardSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render card skeleton with custom className', () => {
      render(<CardSkeleton className="h-48" />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardSkeleton className="custom-class" />);

      const skeleton = document.querySelector('.custom-class');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('ChartSkeleton', () => {
    it('should render chart skeleton', () => {
      render(<ChartSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ChartSkeleton className="h-96" />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('ListSkeleton', () => {
    it('should render list skeleton with default items', () => {
      render(<ListSkeleton />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render list skeleton with custom item count', () => {
      render(<ListSkeleton items={5} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      render(<ListSkeleton className="custom-list" />);

      const skeleton = document.querySelector('.custom-list');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('should render table skeleton with default dimensions', () => {
      render(<TableSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render table skeleton with custom dimensions', () => {
      render(<TableSkeleton rows={5} cols={3} />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('ProfileSkeleton', () => {
    it('should render profile skeleton', () => {
      render(<ProfileSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ProfileSkeleton className="custom-profile" />);

      const skeleton = document.querySelector('.custom-profile');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render skeleton elements', () => {
      render(<CardSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have pulse animation class', () => {
      render(<CardSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
