import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) { }

  async create(dto: CreateAgentDto): Promise<AgentDocument> {
    const agent = new this.agentModel(dto);
    return agent.save();
  }

  async findAll(): Promise<AgentDocument[]> {
    return this.agentModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<AgentDocument> {
    const agent = await this.agentModel.findById(id);
    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }
    return agent;
  }

  async update(id: string, dto: UpdateAgentDto): Promise<AgentDocument> {
    const agent = await this.agentModel.findByIdAndUpdate(id, dto, { new: true });
    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }
    return agent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }
  }
}
