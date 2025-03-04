import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './loading';

describe('Loading 组件测试', () => {
    it('应该正确渲染 Loading 组件', () => {
        render(<Loading />);
        const imageElement = screen.getByAltText('logo');
        expect(imageElement).toBeInTheDocument();
    });

    it('应该正确设置 Image 组件的属性', () => {
        render(<Loading />);
        const imageElement = screen.getByAltText('logo');
        expect(imageElement).toHaveAttribute('width', '200');
        expect(imageElement).toHaveAttribute('height', '200');
        expect(imageElement).toHaveClass('animate-pulse');
        expect(imageElement).toHaveClass('duration-700');
    });
});