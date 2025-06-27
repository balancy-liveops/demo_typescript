import { useState, useEffect, useCallback } from 'react';
import { UnnyObject } from '@balancy/core';

interface UseCachedSpriteResult {
    spriteUrl: string;
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

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
            sprite.loadSprite((url) => {
                console.log("==>> Loaded ", url);
                if (url) {
                    setSpriteUrl(url);
                    setError(null);
                } else {
                    // Fallback на обычный URL
                    setSpriteUrl(sprite.getFullUrl());
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

