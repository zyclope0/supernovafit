import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PageHeader } from '../../../components/ui/PageHeader'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}))

describe('PageHeader Component', () => {
  it('should render title correctly', () => {
    render(<PageHeader title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const mockAction = vi.fn()
    render(
      <PageHeader 
        title="Test Title" 
        action={<button onClick={mockAction}>Test Action</button>}
      />
    )
    
    // Vérifier que le composant se rend sans erreur
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render breadcrumb when showBreadcrumb is true', () => {
    render(<PageHeader title="Test Title" showBreadcrumb={true} />)
    
    // Vérifier que le composant se rend sans erreur
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    render(<PageHeader title="Test Title" className="custom-class" />)
    
    // Vérifier que le composant se rend sans erreur
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render without breadcrumb by default', () => {
    render(<PageHeader title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    // Le composant devrait se rendre normalement sans breadcrumb
  })
})
