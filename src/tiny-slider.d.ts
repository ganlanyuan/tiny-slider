export interface CommonOptions {
    /**
     * The initial index of the slider.
     * @defaultValue 0
     */
    startIndex?: number;
    /**
     * Number of slides being displayed in the viewport.
     * @defaultValue 1
     */
    items?: number;
    /**
     * Space between slides (in "px").
     * @defaultValue 0
     */
    gutter?: number;
    /**
     * Number of slides going on one "click".
     * @defaultValue 1
     */
    slideBy?: number | "page";
    /**
     * Speed of the slide animation (in "ms").
     * @defaultValue 300
     */
    speed?: number;
    /**
     * Height of slider container changes according to each slide"s height.
     * @defaultValue false
     */
    autoHeight?: boolean;
    /**
     * Sets the width of the slides to `auto`.
     * @defaultValue false
     */
    autoWidth?: boolean;
    /**
     * Controls width attribute of the slides.
     * @defaultValue false
     */
    fixedWidth?: number | false;
    /**
     * Space on the outside (in "px").
     * @defaultValue 0
     */
    edgePadding?: number;
    /**
     * Center the active slide in the viewport.
     * @defaultValue false
     */
    center?: boolean;
    /**
     * Controls the display and functionalities of controls components (prev/next buttons). If true, display the controls and add all functionalities.
     * @defaultValue true
     */
    controls?: boolean;
    /**
     * Text or markup in the prev/next buttons
     * @defaultValue ["prev", "next"]
     */
    controlsText?: string[];
    /**
     * Controls the display and functionalities of nav components (dots). If true, display the nav and add all functionalities.
     * @defaultValue true
     */
    nav?: boolean;
    /**
     * Toggles the automatic change of slides
     * @defaultValue false
     */
    autoplay?: boolean;
    /**
     * Stops sliding on mouseover.
     * @defaultValue false
     */
    autoplayHoverPause?: boolean;
    /**
     * Pauses the sliding when the page is invisiable and resumes it when the page become visiable again
     * @defaultValue true
     */
    autoplayResetOnVisibility?: boolean;
    /**
     * Text or markup in the autoplay start/stop button.
     * @defaultValue ["start", "stop"]
     */
    autoplayText?: string[];
    /**
     * Time between 2 autoplay slides change (in "ms").
     * @defaultValue 5000
     */
    autoplayTimeout?: number;
    /**
     * Activates input detection for touch devices.
     * @defaultValue true
     */
    touch?: boolean;
    /**
     * Changing slides by dragging them.
     * @defaultValue false
     */
    mouseDrag?: boolean;
    /**
     * Allows using arrow keys to switch slides.
     * @defaultValue false
     */
    arrowKeys?: boolean;
    /**
     * Disable slider.
     * @defaultValue false
     */
    disable?: boolean;
}

export interface ResponsiveOptions {
    [breakpoint: number]: CommonOptions;
}

export interface TinySliderSettings extends CommonOptions {
    /**
     * @defaultValue ".slider"
     */
    container?: HTMLElement | Element | string;
    /**
     * Controls animation behaviour.
     * With carousel everything slides to the side, while gallery uses fade animations and changes all slides at once.
     * @defaultValue "carousel"
     */
    mode?: "carousel" | "gallery";
    /**
     * The axis of the slider.
     * @defaultValue "horizontal"
     */
    axis?: "horizontal" | "vertical";
    /**
     * The container element/selector around the prev/next buttons.
     * controlsContainer must have at least 2 child elements.
     * @defaultValue false
     */
    controlsContainer?: HTMLElement | Element | string | false;
    /**
     * Controls nav position.
     * @defaultValue "top"
     */
    navPosition?: "top" | "bottom";
    /**
     * The container element/selector around the dots.
     * navContainer must have at least same number of children as the slides.
     * @defaultValue false
     */
    navContainer?: HTMLElement | Element | string | false;
    /**
     * Indicate if the dots are thumbnails. If true, they will always be visible even when more than 1 slides displayed in the viewport.
     * @defaultValue false
     */
    navAsThumbnails?: boolean;
    /**
     * Direction of slide movement (ascending/descending the slide index).
     * @defaultValue "forward"
     */
    autoplayDirection?: "forward" | "backward";
    /**
     * The customized autoplay start/stop button or selector.
     * @defaultValue false
     */
    autoplayButton?: HTMLElement | string | false;
    /**
     * Output autoplayButton markup when autoplay is true but a customized autoplayButton is not provided.
     * @defaultValue true
     */
    autoplayButtonOutput?: boolean;
    /**
     * Name of intro animation class.
     * @defaultValue "tns-fadeIn"
     */
    animateIn?: string;
    /**
     * Name of outro animation class.
     * @defaultValue "tns-fadeOut"
     */
    animateOut?: string;
    /**
     * Name of default animation class.
     * @defaultValue "tns-normal"
     */
    animateNormal?: string;
    /**
     * Time between each gallery animation (in "ms").
     * @defaultValue false
     */
    animateDelay?: number | false;
    /**
     * Moves throughout all the slides seamlessly.
     * @defaultValue true
     */
    nextButton?: HTMLElement | string | false;
    /**
     * Customized previous buttons.
     * This option will be ignored if controlsContainer is a Node element or a CSS selector.
     * @defaultValue false
     */
    prevButton?: HTMLElement | string | false;
    /**
     * Customized next buttons.
     * This option will be ignored if controlsContainer is a Node element or a CSS selector.
     * @defaultValue false
     */
    loop?: boolean;
    /**
     * Moves to the opposite edge when reaching the first or last slide.
     * @defaultValue false
     */
    rewind?: boolean;
    /**
     * Breakpoint: Integer.
     * Defines options for different viewport widths
     * @defaultValue false
     */
    responsive?: ResponsiveOptions | false;
    /**
     * Enables lazyloading images that are currently not viewed, thus saving bandwidth
     * @defaultValue false
     */
    lazyload?: boolean;
    /**
     * The CSS selector for lazyload images.
     * @defaultValue '.tns-lazy-img'
     */
    lazyloadSelector?: string;
    /**
     * Swipe or drag will not be triggered if the angle is not inside the range when set.
     * @defaultValue 15
     */
    swipeAngle?: number | boolean;
    /**
     * Prevent next transition while slider is transforming. 
     * @defaultValue false
     */
    preventActionWhenRunning?: boolean
    /**
     * Prevent page from scrolling on touchmove. If set to "auto", the slider will first check if the touch direction matches the slider axis, then decide whether prevent the page scrolling or not. If set to "force", the slider will always prevent the page scrolling.
     * @defaultValue false
     */
    preventScrollOnTouch?: "auto" | "force" | false;
    /**
     * Difine the relationship between nested sliders.
     * Make sure you run the inner slider first, otherwise the height of the inner slider container will be wrong.
     * @defaultValue false
     */
    nested?: "inner" | "outer" | false;
    /**
     * Indicate whether the slider will be frozen (controls, nav, autoplay and other functions will stop work) when all slides can be displayed in one page.
     * @defaultValue true
     */
    freezable?: boolean;
    /**
     * Prevent page from scrolling on `touchmove`. If set to "auto", the slider will first check if the touch direction matches the slider axis, then decide 
     * whether prevent the page scrolling or not. If set to "force", the slider will always prevent the page scrolling.
     * @defaultValue false
     */
    preventScrollOnTouch?: "auto" | "force" | false;
    /**
    * Nonce attribute for inline style tag to allow slider usage without unsafe-inline CSP Option
    * @defaultValue false
    */
    nonce?: string | false;
    /**
     * Callback to be run on initialization.
     * @defaultValue false
     */
    onInit?: () => void | false;
    /**
     * Save browser capability variables to localStorage and without detecting them everytime the slider runs if set to true.
     * @defaultValue true
     */
    useLocalStorage?: boolean;
}

export interface TinySliderInfo {
    event: Event | {}
    cloneCount: number;
    container: HTMLElement;
    controlsContainer?: boolean;
    hasControls: boolean;
    index: number;
    indexCached: number;
    items: number;
    navContainer?: HTMLElement;
    navCurrentIndex?: number;
    navCurrentIndexCached?: number;
    navItems?: HTMLCollection;
    nextButton?: HTMLElement;
    prevButton?: HTMLElement;
    slideBy: number;
    slideCount: number;
    slideCountNew: number;
    slideItems: HTMLCollection;
    visibleNavIndexes?: number;
    visibleNavIndexesCached?: number;
}

export type SilderEvent = 'indexChanged' | 'transitionStart' | 'transitionEnd' | 'newBreakpointStart' | 'newBreakpointEnd' | 'touchStart' | 'touchMove' | 'touchEnd' | 'dragStart' | 'dragMove' | 'dragEnd';

export interface TinySliderInstance {
    /**
     * tiny-slider version
     */
    version: number;

    /**
     * Get the info about current tiny-slider instance
     */
    getInfo(): TinySliderInfo;

    /**
     * Events controller
     */
    events: {
        /**
         * Subscribe to event
         * @param event event to listen to
         * @param cb a callback function, invoked on event
         */
        on(event: SilderEvent, cb: (info: TinySliderInfo) => any): void;

        /**
         * Unsubscribe from event
         * @param event event to unsibscribe from
         * @param cb a reference to callback function
         */
        off(event: SilderEvent, cb: (info: TinySliderInfo) => any): void;
    },

    /**
     * Go to specific slide by number or keywords.
     * @param target the slide to go to (index or a code-word)
     */
    goTo(target: number | 'next' | 'prev' | 'first' | 'last'): void,

    /**
     * Programmatically start slider autoplay when autoplay: true.
     */
    play(): void;

    /**
     * Programmatically stop slider autoplay when autoplay: true.
     */
    pause(): void;

    /**
     *
     */
    isOn: boolean;


    /**
     * Manually adjust slider height when autoHeight is true.
     */
    updateSliderHeight(): void;

    /**
     *
     */
    refresh(): void;

    /**
     * Destroy the slider.
     */
    destroy(): void;

    /**
     * Rebuild the slider after destroying it.
     *
     * @returns a new tinyslider instance.
     */
    rebuild(): TinySliderInstance;
}

export function tns(options: TinySliderSettings): TinySliderInstance;
