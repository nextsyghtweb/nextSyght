import { Component } from 'react';

/**
 * SceneBoundary – if the 3D scene crashes or its code fails to download,
 * call `onError` (which switches the page to the simple fallback) instead of
 * breaking the whole website.
 */
export default class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[Nextsyght] 3D scene failed, using fallback:', error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
