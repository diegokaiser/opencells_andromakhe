
import { css } from "lit";

/**
 * Base visual compartida por páginas de formulario con Shadow DOM.
 * Utiliza la paleta global mediante variables CSS heredadas.
 */
export const formPageStyles = css`
	:host {
		display: block;
		box-sizing: border-box;
		min-height: 100%;
		padding: 2rem 1.5rem;
		background: var(--app-surface);
		color: var(--app-text);
	}

  /* El cálculo de tamaños también se aplica dentro de cada Shadow DOM. */
  * {
    box-sizing: border-box;
  }

  form,
  fieldset {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }

  form {
    max-width: 36rem;
    margin-block: 1.5rem;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  label {
    font-weight: 600;
  }

  /* Campos legibles sobre la superficie principal azul. */
  input,
  select {
    width: 100%;
    min-width: 0;
    padding: 0.875rem 1rem;
    border: 1px solid var(--app-border);
    border-radius: 0.875rem;
    background: var(--app-surface-dark);
    color: var(--app-text);
    font: inherit;
    color-scheme: dark;
  }

  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--app-text);
    outline-offset: 3px;
  }

  /* Acciones legibles y reconocibles sin depender únicamente del color. */
  button {
    width: fit-content;
    min-height: 2.75rem;
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--app-border);
    border-radius: 0.875rem;
    background: var(--app-surface-dark);
    color: var(--app-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background: var(--app-surface);
  }

  button:focus-visible {
    outline: 2px solid var(--app-text);
    outline-offset: 3px;
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
