import { useState, useCallback } from 'react';
import { deriveKey, encryptData, decryptData } from '@/lib/vault-crypto';

export interface VaultState {
    isUnlocked: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useVault() {
    const [state, setState] = useState<VaultState>({
        isUnlocked: false,
        isLoading: false,
        error: null,
    });

    const [vaultKey, setVaultKey] = useState<string | null>(null); // Las claves se guardan de forma temporal ( luego se borran )

    const unlock = useCallback(async (password: string) => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            // TODO: Aca se asume que se paso una contrase;a ( en deploy, debo cambiarlo ya que no puedo asumir simplemente que hay x o y porque si no hay rompe / colapsa como mi cabeza este ultimo mes )
            setVaultKey(password);
            setState(s => ({ ...s, isUnlocked: true, isLoading: false }));
            return true;
        } catch (e) {
            setState(s => ({ ...s, isLoading: false, error: 'Failed to unlock' }));
            return false;
        }
    }, []);

    const lock = useCallback(() => {
        setVaultKey(null);
        setState({ isUnlocked: false, isLoading: false, error: null });
    }, []);

    const encrypt = useCallback(async (text: string) => {
        if (!vaultKey) throw new Error("Vault locked");
        return encryptData(text, vaultKey);
    }, [vaultKey]);

    const decrypt = useCallback(async (cipher: string, iv: string, salt: string) => {
        if (!vaultKey) throw new Error("Vault locked");
        return decryptData(cipher, iv, salt, vaultKey);
    }, [vaultKey]);

    return {
        ...state,
        unlock,
        lock,
        encrypt,
        decrypt
    };
}
