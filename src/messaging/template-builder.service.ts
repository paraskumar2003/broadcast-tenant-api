import { Injectable, Logger } from '@nestjs/common';
import { TemplateComponent } from '../meta-api/meta-api.service';

/**
 * Builds Meta Cloud API template components from a raw template definition and parameters.
 * Extracted from the 100+ line forEach in the old genralFunction.js.
 */
@Injectable()
export class TemplateBuilderService {
  private readonly logger = new Logger(TemplateBuilderService.name);

  /**
   * Build template components array from the template definition and parameters.
   */
  buildComponents(
    templateComponents: any[],
    params: Record<string, any>,
  ): TemplateComponent[] {
    const components: TemplateComponent[] = [];

    for (const element of templateComponents) {
      switch (element.type) {
        case 'HEADER':
          this.buildHeader(element, params, components);
          break;
        case 'BODY':
          this.buildBody(params, components);
          break;
        case 'CAROUSEL':
          this.buildCarousel(element, components);
          break;
        case 'BUTTONS':
          this.buildButtons(element, params, components);
          break;
        // FOOTER is intentionally skipped (no parameters needed)
      }
    }

    return components;
  }

  private buildHeader(
    element: any,
    params: Record<string, any>,
    components: TemplateComponent[],
  ): void {
    let headerParameter: any;

    switch (element.format) {
      case 'VIDEO':
        headerParameter = {
          type: 'video',
          video: { link: params.image },
        };
        break;
      case 'DOCUMENT':
        headerParameter = {
          type: 'document',
          document: { link: params.image, filename: 'Document' },
        };
        break;
      case 'IMAGE':
      default:
        headerParameter = {
          type: 'image',
          image: { link: params.image },
        };
        break;
    }

    components.push({
      type: 'header',
      parameters: [headerParameter],
    });
  }

  private buildBody(
    params: Record<string, any>,
    components: TemplateComponent[],
  ): void {
    const bodyParameters: any[] = [];

    // Extract numbered parameters (1, 2, 3...) as body text parameters
    Object.keys(params)
      .filter((key) => Number.isInteger(parseInt(key)))
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((key) => {
        bodyParameters.push({
          type: 'text',
          text: String(params[key]),
        });
      });

    components.push({
      type: 'body',
      parameters: bodyParameters,
    });
  }

  private buildCarousel(element: any, components: TemplateComponent[]): void {
    const cards = element.cards.map((_: any, index: number) => ({
      card_index: index,
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: `https://almondvirtex.s3.ap-south-1.amazonaws.com/communication/carousel/${index + 1}.png`,
              },
            },
          ],
        },
      ],
    }));

    components.push({
      type: 'carousel',
      cards,
    });
  }

  private buildButtons(
    element: any,
    params: Record<string, any>,
    components: TemplateComponent[],
  ): void {
    if (!element.buttons) return;

    element.buttons.forEach((button: any, index: number) => {
      if (button.type === 'URL') {
        const buttonParam = params[`button_${index + 1}`];

        if (buttonParam) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [{ type: 'text', text: buttonParam }],
          });
        } else if (button.parameters && button.parameters.length > 0) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index: index,
            parameters: [
              {
                type: button.parameters[0]?.type || 'text',
                text: button.parameters[0]?.text || '/',
              },
            ],
          });
        }
      } else if (button.type === 'FLOW') {
        components.push({
          type: 'button',
          sub_type: 'flow',
          index: '0',
        });
      }
    });
  }
}
