import { useState, useEffect, useCallback } from 'react';
import { UnnyObject } from '@balancy/core';

interface UseCachedSpriteResult {
    spriteUrl: string;
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

/**
 * Хук для загрузки и кеширования спрайтов
 * @param sprite UnnyObject спрайт для загрузки
 * @param enableCache включить ли кеширование (по умолчанию true)
 * @returns объект с URL спрайта, состоянием загрузки и методом перезагрузки
 */
export const useCachedSprite = (
    sprite: UnnyObject | null | undefined,
    enableCache: boolean = true
): UseCachedSpriteResult => {
    const [spriteUrl, setSpriteUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSprite = useCallback(() => {
        if (!sprite) {
            setSpriteUrl("");
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        if (enableCache) {
            console.log("==>> Загрузка спрайта с кешированием: ", sprite.id);
            sprite.loadSprite((url) => {
                console.log("==>> Loaded ", url);
                if (url) {
                    setSpriteUrl(url);
                    setError(null);
                } else {
                    // Fallback на обычный URL
                    console.warn('Ошибка загрузки кешированного спрайта, используем fallback');
                    setSpriteUrl(sprite.getFullUrl());
                    setError('Ошибка кеширования, используется прямая загрузка');
                }
                setIsLoading(false);
            });
        } else {
            // Прямая загрузка без кеширования
            setSpriteUrl(sprite.getFullUrl());
            setIsLoading(false);
        }
    }, [sprite, enableCache]);

    useEffect(() => {
        loadSprite();
    }, [loadSprite]);

    const reload = useCallback(() => {
        loadSprite();
    }, [loadSprite]);

    return {
        spriteUrl,
        isLoading,
        error,
        reload
    };
};

/**
 * Хук для управления кешем спрайтов
 */
export const useSpriteCache = () => {
    const clearCache = useCallback(() => {
        UnnyObject.clearSpriteCache();
    }, []);

    const preloadSprites = useCallback((sprites: UnnyObject[]) => {
        UnnyObject.preloadSprites(sprites);
    }, []);

    return {
        clearCache,
        preloadSprites
    };
};
